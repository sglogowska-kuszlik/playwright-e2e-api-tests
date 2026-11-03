<?php
/**
 * Plugin Name: Playwright Registration Settings
 */

add_filter('pre_option_woocommerce_enable_myaccount_registration', static fn() => 'yes');
add_filter('pre_option_woocommerce_registration_generate_username', static fn() => 'yes');
add_filter('pre_option_woocommerce_registration_generate_password', static fn() => 'no');
