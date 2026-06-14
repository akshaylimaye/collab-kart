package com.collabkart.service;

import java.io.IOException;
import java.io.InputStream;
import java.net.URI;
import java.net.URLDecoder;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.core.env.Environment;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;
import com.collabkart.exception.ApiException;

@Component
@RequiredArgsConstructor
@ConditionalOnProperty(name = "app.image-migration.enabled", havingValue = "true")
public class LocalImageCloudinaryMigrationRunner implements CommandLineRunner {

    private static final String CLOUDINARY_URL_PREFIX = "https://res.cloudinary.com/";

    private final JdbcTemplate jdbcTemplate;
    private final ImageStorageService imageStorageService;
    private final Environment environment;
    private final ConfigurableApplicationContext applicationContext;

    @Value("${app.upload.base-dir:uploads}")
    private String uploadBaseDir;

    @Value("${app.image-migration.dry-run:false}")
    private boolean dryRun;

    @Value("${app.image-migration.allow-non-local-db:false}")
    private boolean allowNonLocalDb;

    @Override
    public void run(String... args) {
        int exitCode = 0;
        try {
            runMigration();
        } catch (RuntimeException exception) {
            exitCode = 1;
            System.err.println("Image migration failed: " + exception.getMessage());
        } finally {
            int finalExitCode = exitCode;
            SpringApplication.exit(applicationContext, () -> finalExitCode);
            System.exit(finalExitCode);
        }
    }

    private void runMigration() {
        String datasourceUrl = environment.getProperty("spring.datasource.url", "unknown");
        Path uploadsRoot = Paths.get(uploadBaseDir).toAbsolutePath().normalize();

        validateCloudinaryConfiguration();
        validateStorageBean();
        validateDatabase(datasourceUrl);
        validateUploadsRoot(uploadsRoot);

        System.out.println("CollabKart local image migration to Cloudinary");
        System.out.println("Mode: " + (dryRun ? "DRY RUN" : "UPLOAD AND UPDATE"));
        System.out.println("Database URL: " + maskedDatasourceUrl(datasourceUrl));
        System.out.println("Uploads directory: " + uploadsRoot);
        System.out.println("Please backup your database and uploads folder before continuing.");

        Summary summary = new Summary();
        migrateTable(
                "Campaign images",
                "campaigns",
                "product_image_url",
                "campaign-images",
                uploadsRoot,
                summary,
                imageStorageService::uploadCampaignImage
        );
        migrateTable(
                "Creator profile images",
                "creator_profiles",
                "profile_image_url",
                "profile-images",
                uploadsRoot,
                summary,
                imageStorageService::uploadCreatorProfileImage
        );
        migrateTable(
                "Brand logos",
                "brand_profiles",
                "logo_image_url",
                "brand-logos",
                uploadsRoot,
                summary,
                imageStorageService::uploadBrandLogo
        );

        System.out.println("\nMigration summary");
        System.out.println("Campaign images migrated: " + summary.campaignMigrated);
        System.out.println("Creator profile images migrated: " + summary.creatorMigrated);
        System.out.println("Brand logos migrated: " + summary.brandMigrated);
        System.out.println("Already Cloudinary skipped: " + summary.alreadyCloudinarySkipped);
        System.out.println("Empty/null skipped: " + summary.emptySkipped);
        System.out.println("Missing local files: " + summary.missingFiles);
        System.out.println("Failed uploads: " + summary.failedUploads);
    }

    private void migrateTable(
            String label,
            String tableName,
            String imageColumn,
            String expectedDirectory,
            Path uploadsRoot,
            Summary summary,
            CloudinaryUpload upload
    ) {
        System.out.println("\nChecking " + label + "...");
        List<Map<String, Object>> rows = jdbcTemplate.queryForList("select id, " + imageColumn + " from " + tableName);
        for (Map<String, Object> row : rows) {
            Object id = row.get("id");
            String currentUrl = Objects.toString(row.get(imageColumn), "").trim();
            if (currentUrl.isBlank()) {
                summary.emptySkipped++;
                continue;
            }
            if (currentUrl.startsWith(CLOUDINARY_URL_PREFIX)) {
                summary.alreadyCloudinarySkipped++;
                continue;
            }

            Path localFile = resolveLocalFile(currentUrl, expectedDirectory, uploadsRoot);
            if (localFile == null || !Files.exists(localFile) || !Files.isRegularFile(localFile)) {
                summary.missingFiles++;
                System.out.println("WARN missing local file for " + tableName + "." + imageColumn + " id=" + id + " url=" + currentUrl);
                continue;
            }

            if (dryRun) {
                System.out.println("DRY RUN would migrate " + tableName + " id=" + id + " file=" + localFile);
                incrementMigrated(summary, tableName);
                continue;
            }

            try {
                String cloudinaryUrl = upload.upload(new PathMultipartFile(localFile));
                jdbcTemplate.update("update " + tableName + " set " + imageColumn + " = ? where id = ?", cloudinaryUrl, id);
                incrementMigrated(summary, tableName);
                System.out.println("Migrated " + tableName + " id=" + id + " -> " + cloudinaryUrl);
            } catch (RuntimeException exception) {
                summary.failedUploads++;
                System.out.println("ERROR failed to migrate " + tableName + " id=" + id + ": " + exception.getMessage());
            }
        }
    }

    private void validateCloudinaryConfiguration() {
        requireEnv("CLOUDINARY_CLOUD_NAME");
        requireEnv("CLOUDINARY_API_KEY");
        requireEnv("CLOUDINARY_API_SECRET");
    }

    private void requireEnv(String key) {
        String value = environment.getProperty(key, "");
        if (value.isBlank()) {
            throw new IllegalStateException(key + " is required for image migration");
        }
    }

    private void validateStorageBean() {
        if (!(imageStorageService instanceof CloudinaryImageStorageService)) {
            throw new IllegalStateException("Cloudinary image storage is not active. Check Cloudinary environment variables.");
        }
    }

    private void validateDatabase(String datasourceUrl) {
        String lowerUrl = datasourceUrl.toLowerCase(Locale.ROOT);
        boolean localLooking = lowerUrl.contains("localhost")
                || lowerUrl.contains("127.0.0.1")
                || lowerUrl.contains("collabkart")
                || lowerUrl.contains("local")
                || lowerUrl.contains("dev")
                || lowerUrl.contains("test");
        if (!localLooking && !allowNonLocalDb) {
            throw new IllegalStateException("Database URL does not look local/dev/test. Set app.image-migration.allow-non-local-db=true only if you intentionally want this.");
        }
    }

    private void validateUploadsRoot(Path uploadsRoot) {
        if (!Files.exists(uploadsRoot) || !Files.isDirectory(uploadsRoot)) {
            throw new IllegalStateException("Uploads directory does not exist: " + uploadsRoot);
        }
    }

    private String maskedDatasourceUrl(String datasourceUrl) {
        return datasourceUrl.replaceAll("(//[^:/@]+):[^@/]+@", "$1:****@");
    }

    private Path resolveLocalFile(String imageUrl, String expectedDirectory, Path uploadsRoot) {
        String path = imageUrl;
        try {
            if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
                path = URI.create(imageUrl).getPath();
            }
        } catch (IllegalArgumentException exception) {
            return null;
        }

        path = URLDecoder.decode(path, java.nio.charset.StandardCharsets.UTF_8);
        String marker = "/uploads/" + expectedDirectory + "/";
        int markerIndex = path.indexOf(marker);
        if (markerIndex < 0 && path.startsWith("uploads/" + expectedDirectory + "/")) {
            path = "/" + path;
            markerIndex = path.indexOf(marker);
        }
        if (markerIndex < 0) {
            return null;
        }

        String filename = path.substring(markerIndex + marker.length());
        if (filename.isBlank() || filename.contains("/") || filename.contains("..")) {
            return null;
        }
        return uploadsRoot.resolve(expectedDirectory).resolve(filename).normalize();
    }

    private void incrementMigrated(Summary summary, String tableName) {
        switch (tableName) {
            case "campaigns" -> summary.campaignMigrated++;
            case "creator_profiles" -> summary.creatorMigrated++;
            case "brand_profiles" -> summary.brandMigrated++;
            default -> throw new IllegalArgumentException("Unknown table: " + tableName);
        }
    }

    private interface CloudinaryUpload {
        String upload(MultipartFile file);
    }

    private static class Summary {
        private int campaignMigrated;
        private int creatorMigrated;
        private int brandMigrated;
        private int alreadyCloudinarySkipped;
        private int emptySkipped;
        private int missingFiles;
        private int failedUploads;
    }

    private static class PathMultipartFile implements MultipartFile {

        private final Path path;
        private final String contentType;

        private PathMultipartFile(Path path) {
            this.path = path;
            this.contentType = detectContentType(path);
        }

        @Override
        public String getName() {
            return "file";
        }

        @Override
        public String getOriginalFilename() {
            return path.getFileName().toString();
        }

        @Override
        public String getContentType() {
            return contentType;
        }

        @Override
        public boolean isEmpty() {
            try {
                return Files.size(path) == 0;
            } catch (IOException exception) {
                return true;
            }
        }

        @Override
        public long getSize() {
            try {
                return Files.size(path);
            } catch (IOException exception) {
                throw new ApiException(HttpStatus.BAD_REQUEST, "Unable to read local image file");
            }
        }

        @Override
        public byte[] getBytes() throws IOException {
            return Files.readAllBytes(path);
        }

        @Override
        public InputStream getInputStream() throws IOException {
            return Files.newInputStream(path);
        }

        @Override
        public void transferTo(java.io.File dest) throws IOException, IllegalStateException {
            Files.copy(path, dest.toPath());
        }

        private static String detectContentType(Path path) {
            try {
                String detected = Files.probeContentType(path);
                if (detected != null) return detected;
            } catch (IOException ignored) {
                // Fall through to extension detection.
            }
            String filename = path.getFileName().toString().toLowerCase(Locale.ROOT);
            if (filename.endsWith(".png")) return "image/png";
            if (filename.endsWith(".webp")) return "image/webp";
            if (filename.endsWith(".jpg") || filename.endsWith(".jpeg")) return "image/jpeg";
            return "application/octet-stream";
        }
    }
}
