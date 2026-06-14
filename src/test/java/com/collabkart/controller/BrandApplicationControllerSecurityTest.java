package com.collabkart.controller;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.security.access.prepost.PreAuthorize;

class BrandApplicationControllerSecurityTest {

    @Test
    void creatorCannotAccessBrandApplicationApisBecauseControllerRequiresBrandRole() {
        PreAuthorize preAuthorize = BrandApplicationController.class.getAnnotation(PreAuthorize.class);

        assertThat(preAuthorize).isNotNull();
        assertThat(preAuthorize.value()).isEqualTo("hasRole('BRAND')");
    }
}
