<?php

// archivo: config/env.php
function getEnvVar($key, $default = null) {
    $envPath = __DIR__ . '../../.env';
    if (!file_exists($envPath)) {
        return $default;
    }

    $env = parse_ini_file($envPath);
    return $env[$key] ?? $default;
}
