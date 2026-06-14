package com.collabkart.config;

import com.collabkart.entity.BrandProfile;
import com.collabkart.entity.Campaign;
import com.collabkart.entity.CampaignStatus;
import com.collabkart.entity.CommissionType;
import com.collabkart.entity.CreatorProfile;
import com.collabkart.entity.Role;
import com.collabkart.entity.User;
import com.collabkart.repository.BrandProfileRepository;
import com.collabkart.repository.CampaignRepository;
import com.collabkart.repository.CreatorProfileRepository;
import com.collabkart.repository.UserRepository;
import java.math.BigDecimal;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@Profile("dev")
@RequiredArgsConstructor
public class DevSampleDataSeeder implements CommandLineRunner {

    private static final String TEST_PASSWORD = "Test@12345";

    private final UserRepository userRepository;
    private final BrandProfileRepository brandProfileRepository;
    private final CreatorProfileRepository creatorProfileRepository;
    private final CampaignRepository campaignRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        seedBrands();
        seedCreators();
    }

    private void seedBrands() {
        for (BrandSeed brandSeed : brandSeeds()) {
            User user = upsertUser(brandSeed.name(), brandSeed.email(), Role.BRAND);
            BrandProfile profile = brandProfileRepository.findByUserId(user.getId())
                    .map(existing -> fillMissingBrandProfile(existing, brandSeed))
                    .orElseGet(() -> brandProfileRepository.save(BrandProfile.builder()
                            .user(user)
                            .brandName(brandSeed.name())
                            .website(brandSeed.website())
                            .instagramHandle(brandSeed.instagramHandle())
                            .category(brandSeed.category())
                            .description(brandSeed.description())
                            .logoImageUrl(null)
                            .build()));

            for (CampaignSeed campaignSeed : brandSeed.campaigns()) {
                boolean exists = campaignRepository.existsByBrandProfileIdAndTitleAndProductName(
                        profile.getId(), campaignSeed.title(), campaignSeed.productName());
                if (!exists) {
                    campaignRepository.save(Campaign.builder()
                            .brandProfile(profile)
                            .title(campaignSeed.title())
                            .productName(campaignSeed.productName())
                            .description(campaignSeed.description())
                            .category(campaignSeed.category())
                            .productImageUrl(null)
                            .commissionType(campaignSeed.commissionType())
                            .commissionValue(BigDecimal.valueOf(campaignSeed.commissionValue()))
                            .status(CampaignStatus.DRAFT)
                            .build());
                }
            }
        }
    }

    private void seedCreators() {
        for (CreatorSeed creatorSeed : creatorSeeds()) {
            User user = upsertUser(creatorSeed.name(), creatorSeed.email(), Role.CREATOR);
            creatorProfileRepository.findByUserId(user.getId())
                    .ifPresentOrElse(
                            existing -> fillMissingCreatorProfile(existing, creatorSeed),
                            () -> creatorProfileRepository.save(CreatorProfile.builder()
                                    .user(user)
                                    .instagramHandle(creatorSeed.instagramHandle())
                                    .followerCount(creatorSeed.followerCount())
                                    .category(creatorSeed.category())
                                    .city(creatorSeed.city())
                                    .bio(creatorSeed.bio())
                                    .profileImageUrl(null)
                                    .build())
                    );
        }
    }

    private User upsertUser(String name, String email, Role role) {
        String normalizedEmail = email.trim().toLowerCase();
        return userRepository.findByEmail(normalizedEmail)
                .map(existing -> {
                    existing.setName(name);
                    existing.setRole(role);
                    existing.setPasswordHash(passwordEncoder.encode(TEST_PASSWORD));
                    return userRepository.save(existing);
                })
                .orElseGet(() -> userRepository.save(User.builder()
                        .name(name)
                        .email(normalizedEmail)
                        .passwordHash(passwordEncoder.encode(TEST_PASSWORD))
                        .role(role)
                        .build()));
    }

    private BrandProfile fillMissingBrandProfile(BrandProfile profile, BrandSeed seed) {
        if (isBlank(profile.getBrandName())) profile.setBrandName(seed.name());
        if (isBlank(profile.getWebsite())) profile.setWebsite(seed.website());
        if (isBlank(profile.getInstagramHandle())) profile.setInstagramHandle(seed.instagramHandle());
        if (isBlank(profile.getCategory())) profile.setCategory(seed.category());
        if (isBlank(profile.getDescription())) profile.setDescription(seed.description());
        return brandProfileRepository.save(profile);
    }

    private void fillMissingCreatorProfile(CreatorProfile profile, CreatorSeed seed) {
        if (isBlank(profile.getInstagramHandle())) profile.setInstagramHandle(seed.instagramHandle());
        if (profile.getFollowerCount() == null) profile.setFollowerCount(seed.followerCount());
        if (isBlank(profile.getCategory())) profile.setCategory(seed.category());
        if (isBlank(profile.getCity())) profile.setCity(seed.city());
        if (isBlank(profile.getBio())) profile.setBio(seed.bio());
        creatorProfileRepository.save(profile);
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }

    private List<BrandSeed> brandSeeds() {
        return List.of(
                new BrandSeed(
                        "BrewBeans Coffee",
                        "brewbeans.brand@test.com",
                        "Food & Beverages",
                        "https://brewbeans.example",
                        "brewbeans.coffee",
                        "Premium coffee brand offering cold brew, instant coffee sachets, and cafe-style coffee kits for young professionals and students.",
                        List.of(
                                new CampaignSeed("Monsoon Coffee Launch", "Instant Cold Brew Sachets", "Food & Beverages", CommissionType.PERCENTAGE, 12,
                                        "Promote our new instant cold brew sachets made for busy students and working professionals. Creators should create short-form content showing how quickly the coffee can be prepared at home, office, or while travelling."),
                                new CampaignSeed("Strong Coffee Challenge", "Xpresso Strong Coffee", "Food & Beverages", CommissionType.FIXED, 150,
                                        "We are looking for creators to showcase our strong coffee blend for people who love bold flavour and high-energy mornings. Content can include morning routine, gym pre-workout coffee, or work-from-home setup."),
                                new CampaignSeed("Iced Coffee Summer Drop", "Iced Mocha Coffee Kit", "Food & Beverages", CommissionType.PERCENTAGE, 10,
                                        "Create engaging content around our iced mocha coffee kit. Show how to make cafe-style iced coffee at home in under 2 minutes. Ideal for lifestyle, food, and student creators.")
                        )
                ),
                new BrandSeed(
                        "GlowVeda Skincare",
                        "glowveda.brand@test.com",
                        "Beauty & Skincare",
                        "https://glowveda.example",
                        "glowveda.skin",
                        "Ayurveda-inspired skincare brand creating gentle face serums, moisturizers, and glow routines for everyday skincare.",
                        List.of(
                                new CampaignSeed("Glow Serum Creator Trial", "Vitamin C Glow Serum", "Beauty & Skincare", CommissionType.PERCENTAGE, 15,
                                        "Looking for skincare and lifestyle creators to promote our Vitamin C Glow Serum through honest routine-based reels and before-after style content."),
                                new CampaignSeed("Monsoon Skin Care Routine", "Hydrating Gel Moisturizer", "Beauty & Skincare", CommissionType.FIXED, 200,
                                        "Create content around a simple monsoon skincare routine using our hydrating gel moisturizer. Focus on lightweight, non-sticky, daily skincare.")
                        )
                ),
                new BrandSeed(
                        "FitFuel Nutrition",
                        "fitfuel.brand@test.com",
                        "Fitness & Health",
                        "https://fitfuel.example",
                        "fitfuel.india",
                        "Fitness nutrition brand offering clean snacks, energy bars, and healthy daily routine products.",
                        List.of(
                                new CampaignSeed("Healthy Snack Routine", "Protein Energy Bars", "Fitness & Health", CommissionType.PERCENTAGE, 12,
                                        "Promote our protein energy bars as a clean snack for gym-goers, office workers, and students. Content can include gym bag essentials, office snack routine, or pre-workout snack ideas."),
                                new CampaignSeed("Fitness Creator Starter Campaign", "Daily Nutrition Trial Pack", "Fitness & Health", CommissionType.FIXED, 180,
                                        "We are looking for fitness and lifestyle creators to showcase our daily nutrition trial pack in routine-based content.")
                        )
                ),
                new BrandSeed(
                        "UrbanThread",
                        "urbanthread.brand@test.com",
                        "Fashion & Lifestyle",
                        "https://urbanthread.example",
                        "urbanthread.in",
                        "Casual fashion brand creating everyday streetwear, oversized tees, and lifestyle apparel for young Indian shoppers.",
                        List.of(
                                new CampaignSeed("Streetwear Drop", "Oversized Graphic T-Shirt", "Fashion & Lifestyle", CommissionType.PERCENTAGE, 14,
                                        "Promote our new oversized graphic t-shirt drop through outfit reels, college looks, casual styling, and streetwear content."),
                                new CampaignSeed("Weekend Outfit Campaign", "Casual Co-ord Set", "Fashion & Lifestyle", CommissionType.FIXED, 250,
                                        "Looking for fashion and lifestyle creators to style our casual co-ord set for weekend outings, cafe looks, and travel content.")
                        )
                )
        );
    }

    private List<CreatorSeed> creatorSeeds() {
        return List.of(
                new CreatorSeed("Vaishnavi Vaidya", "vaishnavi.creator@test.com", "vaish_journey", 1234, "Fitness & Health", "Pune", "I create fitness, lifestyle, and daily routine content for young working professionals."),
                new CreatorSeed("Aarav Mehta", "aarav.creator@test.com", "aarav.coffee.life", 5400, "Food & Beverages", "Mumbai", "Coffee, cafe, and food content creator sharing simple product-led reels and honest recommendations."),
                new CreatorSeed("Nisha Sharma", "nisha.creator@test.com", "nisha.glowdiary", 8700, "Beauty & Skincare", "Bengaluru", "Skincare and beauty creator focused on simple routines, affordable products, and honest reviews."),
                new CreatorSeed("Kabir Rao", "kabir.creator@test.com", "kabir.styles", 3200, "Fashion & Lifestyle", "Delhi", "Fashion and lifestyle creator making outfit reels, streetwear styling videos, and product discovery content."),
                new CreatorSeed("Meera Iyer", "meera.creator@test.com", "meera.technotes", 6100, "Technology", "Hyderabad", "Tech and productivity creator sharing apps, gadgets, workflows, and useful digital tools."),
                new CreatorSeed("Rohan Patil", "rohan.creator@test.com", "rohan.travelbytes", 4500, "Travel", "Pune", "Travel and lifestyle creator sharing budget trips, stays, cafes, and local experiences.")
        );
    }

    private record BrandSeed(String name, String email, String category, String website, String instagramHandle,
                             String description, List<CampaignSeed> campaigns) {
    }

    private record CampaignSeed(String title, String productName, String category, CommissionType commissionType,
                                int commissionValue, String description) {
    }

    private record CreatorSeed(String name, String email, String instagramHandle, int followerCount, String category,
                               String city, String bio) {
    }
}
