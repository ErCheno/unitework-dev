-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 02-05-2025 a las 18:42:21
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `unitework`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `espacios_trabajo`
--

CREATE TABLE `espacios_trabajo` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `creado_por` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `numero_tableros` int(11) DEFAULT 0,
  `numero_mapas_mentales` int(11) DEFAULT 0,
  `numero_miembros` int(11) DEFAULT 0,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `ultima_actividad` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `espacios_trabajo`
--

INSERT INTO `espacios_trabajo` (`id`, `nombre`, `descripcion`, `creado_por`, `numero_tableros`, `numero_mapas_mentales`, `numero_miembros`, `fecha_creacion`, `ultima_actividad`) VALUES
(145, 'Tablero chenbo', '', '5f1e4884-7fa6-4ebf-b6d0-5cc2bf43a23e', 2, 0, 1, '2025-05-02 16:34:40', '2025-05-02 16:41:36');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `estados_tareas`
--

CREATE TABLE `estados_tareas` (
  `id` int(11) NOT NULL,
  `nombre` varchar(50) NOT NULL,
  `creado_por` char(36) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `estados_tareas`
--

INSERT INTO `estados_tareas` (`id`, `nombre`, `creado_por`) VALUES
(1, 'por_hacer', NULL),
(2, 'en_progreso', NULL),
(3, 'completado', NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `invitaciones`
--

CREATE TABLE `invitaciones` (
  `id` int(11) NOT NULL,
  `email` varchar(100) NOT NULL,
  `espacio_trabajo_id` int(11) DEFAULT NULL,
  `tablero_id` int(11) DEFAULT NULL,
  `rol_espacio_trabajo` enum('admin','miembro') DEFAULT 'miembro',
  `rol_tablero` enum('admin','miembro') DEFAULT 'miembro',
  `estado` enum('pendiente','aceptada','rechazada') DEFAULT 'pendiente',
  `token` varchar(255) NOT NULL,
  `fecha_envio` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_aceptacion` timestamp NULL DEFAULT NULL,
  `fecha_expiracion` datetime DEFAULT NULL,
  `remitente_id` char(36) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `invitaciones`
--

INSERT INTO `invitaciones` (`id`, `email`, `espacio_trabajo_id`, `tablero_id`, `rol_espacio_trabajo`, `rol_tablero`, `estado`, `token`, `fecha_envio`, `fecha_aceptacion`, `fecha_expiracion`, `remitente_id`) VALUES
(42, 'miguel@gmail.com', 145, 59, 'miembro', 'admin', 'aceptada', '76868205180cd349634e1e699c6d55b4921b6f06ff2b944f2af2e69e2985cd67', '2025-05-02 16:34:55', '2025-05-02 16:35:06', '2025-05-09 18:34:55', '5f1e4884-7fa6-4ebf-b6d0-5cc2bf43a23e'),
(43, 'emiliojesus786@gmail.com', 145, 60, 'miembro', 'admin', 'aceptada', '5b6f23b34fa3dea5a13dcd287170ac2921a555ac13adfd62087d744db46b2e19', '2025-05-02 16:35:27', '2025-05-02 16:40:46', '2025-05-09 18:35:27', 'cb78139f-43d3-480e-b3a5-3fdc7d2a9867');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `mapas_mentales`
--

CREATE TABLE `mapas_mentales` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `contenido` text DEFAULT NULL,
  `espacio_trabajo_id` int(11) DEFAULT NULL,
  `creado_por` char(36) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `miembros_espacios_trabajo`
--

CREATE TABLE `miembros_espacios_trabajo` (
  `id` int(11) NOT NULL,
  `usuario_id` char(36) NOT NULL,
  `espacio_trabajo_id` int(11) NOT NULL,
  `rol` enum('admin','miembro') DEFAULT 'miembro'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `miembros_espacios_trabajo`
--

INSERT INTO `miembros_espacios_trabajo` (`id`, `usuario_id`, `espacio_trabajo_id`, `rol`) VALUES
(97, '5f1e4884-7fa6-4ebf-b6d0-5cc2bf43a23e', 145, 'admin'),
(98, 'cb78139f-43d3-480e-b3a5-3fdc7d2a9867', 145, 'miembro');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `miembros_tableros`
--

CREATE TABLE `miembros_tableros` (
  `id` int(11) NOT NULL,
  `usuario_id` char(36) NOT NULL,
  `tablero_id` int(11) NOT NULL,
  `rol` enum('admin','miembro') DEFAULT 'miembro'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `miembros_tableros`
--

INSERT INTO `miembros_tableros` (`id`, `usuario_id`, `tablero_id`, `rol`) VALUES
(76, '5f1e4884-7fa6-4ebf-b6d0-5cc2bf43a23e', 59, 'admin'),
(77, 'cb78139f-43d3-480e-b3a5-3fdc7d2a9867', 59, 'admin'),
(78, 'cb78139f-43d3-480e-b3a5-3fdc7d2a9867', 60, 'admin'),
(79, '5f1e4884-7fa6-4ebf-b6d0-5cc2bf43a23e', 60, 'admin');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tableros`
--

CREATE TABLE `tableros` (
  `id` int(11) NOT NULL,
  `nombre` varchar(255) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `espacio_trabajo_id` int(11) DEFAULT NULL,
  `creado_por` char(36) NOT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `tableros`
--

INSERT INTO `tableros` (`id`, `nombre`, `descripcion`, `espacio_trabajo_id`, `creado_por`, `fecha_creacion`) VALUES
(59, 'Tablero Emilio', '', 145, '5f1e4884-7fa6-4ebf-b6d0-5cc2bf43a23e', '2025-05-02 16:34:49'),
(60, 'Tablero Miguel', '', 145, 'cb78139f-43d3-480e-b3a5-3fdc7d2a9867', '2025-05-02 16:35:22');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tareas`
--

CREATE TABLE `tareas` (
  `id` int(11) NOT NULL,
  `titulo` varchar(255) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `estado_id` int(11) NOT NULL,
  `asignado_a` char(36) DEFAULT NULL,
  `tablero_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

CREATE TABLE `usuarios` (
  `id` char(36) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `token` varchar(255) DEFAULT NULL,
  `fecha_registro` timestamp NOT NULL DEFAULT current_timestamp(),
  `avatar_url` varchar(255) DEFAULT NULL,
  `token_expira` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `usuarios`
--

INSERT INTO `usuarios` (`id`, `nombre`, `email`, `password`, `token`, `fecha_registro`, `avatar_url`, `token_expira`) VALUES
('5f1e4884-7fa6-4ebf-b6d0-5cc2bf43a23e', 'Emilio', 'emiliojesus786@gmail.com', '$2y$10$IuFgkaovFPtCxZf0fd/iE.OrNOlciCxrD.fUq0negoD0Y3AaKg0Cq', 'b9d5078c53c8ccd4d45620d712bb737a159b36fe468205d287568e130c775d8f', '2025-05-02 12:30:12', 'avatar_6814baf25bd1a.jpg', '2025-05-06 22:35:31'),
('cb78139f-43d3-480e-b3a5-3fdc7d2a9867', 'Miguel', 'miguel@gmail.com', '$2y$10$S6pYrMiSed/Z6goLWZdEMOW91yymnDf6e0BOtGRvKjaXcGzS2r/v6', '2f13ac676f490c0dd7314099c92f3e538462001be9e6d37af05903268c61e026', '2025-05-02 12:33:12', 'avatar_6814bcf8dc4a8.jpeg', '2025-05-06 22:35:03');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `espacios_trabajo`
--
ALTER TABLE `espacios_trabajo`
  ADD PRIMARY KEY (`id`),
  ADD KEY `creado_por` (`creado_por`);

--
-- Indices de la tabla `estados_tareas`
--
ALTER TABLE `estados_tareas`
  ADD PRIMARY KEY (`id`),
  ADD KEY `creado_por` (`creado_por`);

--
-- Indices de la tabla `invitaciones`
--
ALTER TABLE `invitaciones`
  ADD PRIMARY KEY (`id`),
  ADD KEY `espacio_trabajo_id` (`espacio_trabajo_id`),
  ADD KEY `tablero_id` (`tablero_id`),
  ADD KEY `fk_remitente` (`remitente_id`);

--
-- Indices de la tabla `mapas_mentales`
--
ALTER TABLE `mapas_mentales`
  ADD PRIMARY KEY (`id`),
  ADD KEY `espacio_trabajo_id` (`espacio_trabajo_id`),
  ADD KEY `creado_por` (`creado_por`);

--
-- Indices de la tabla `miembros_espacios_trabajo`
--
ALTER TABLE `miembros_espacios_trabajo`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `usuario_id_2` (`usuario_id`,`espacio_trabajo_id`),
  ADD KEY `usuario_id` (`usuario_id`),
  ADD KEY `espacio_trabajo_id` (`espacio_trabajo_id`);

--
-- Indices de la tabla `miembros_tableros`
--
ALTER TABLE `miembros_tableros`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `usuario_id_2` (`usuario_id`,`tablero_id`),
  ADD KEY `usuario_id` (`usuario_id`),
  ADD KEY `tablero_id` (`tablero_id`);

--
-- Indices de la tabla `tableros`
--
ALTER TABLE `tableros`
  ADD PRIMARY KEY (`id`),
  ADD KEY `espacio_trabajo_id` (`espacio_trabajo_id`),
  ADD KEY `creado_por` (`creado_por`);

--
-- Indices de la tabla `tareas`
--
ALTER TABLE `tareas`
  ADD PRIMARY KEY (`id`),
  ADD KEY `estado_id` (`estado_id`),
  ADD KEY `asignado_a` (`asignado_a`),
  ADD KEY `tablero_id` (`tablero_id`);

--
-- Indices de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `espacios_trabajo`
--
ALTER TABLE `espacios_trabajo`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=146;

--
-- AUTO_INCREMENT de la tabla `estados_tareas`
--
ALTER TABLE `estados_tareas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `invitaciones`
--
ALTER TABLE `invitaciones`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=44;

--
-- AUTO_INCREMENT de la tabla `mapas_mentales`
--
ALTER TABLE `mapas_mentales`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `miembros_espacios_trabajo`
--
ALTER TABLE `miembros_espacios_trabajo`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=100;

--
-- AUTO_INCREMENT de la tabla `miembros_tableros`
--
ALTER TABLE `miembros_tableros`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=80;

--
-- AUTO_INCREMENT de la tabla `tableros`
--
ALTER TABLE `tableros`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=61;

--
-- AUTO_INCREMENT de la tabla `tareas`
--
ALTER TABLE `tareas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `estados_tareas`
--
ALTER TABLE `estados_tareas`
  ADD CONSTRAINT `estados_tareas_ibfk_1` FOREIGN KEY (`creado_por`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL;

--
-- Filtros para la tabla `invitaciones`
--
ALTER TABLE `invitaciones`
  ADD CONSTRAINT `FK_invitaciones_espacio_trabajo_id` FOREIGN KEY (`espacio_trabajo_id`) REFERENCES `espacios_trabajo` (`id`),
  ADD CONSTRAINT `FK_invitaciones_tablero_id` FOREIGN KEY (`tablero_id`) REFERENCES `tableros` (`id`),
  ADD CONSTRAINT `fk_remitente` FOREIGN KEY (`remitente_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `mapas_mentales`
--
ALTER TABLE `mapas_mentales`
  ADD CONSTRAINT `mapas_mentales_ibfk_1` FOREIGN KEY (`espacio_trabajo_id`) REFERENCES `espacios_trabajo` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `mapas_mentales_ibfk_2` FOREIGN KEY (`creado_por`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `miembros_espacios_trabajo`
--
ALTER TABLE `miembros_espacios_trabajo`
  ADD CONSTRAINT `fk_miembros_espacio` FOREIGN KEY (`espacio_trabajo_id`) REFERENCES `espacios_trabajo` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_miembros_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `miembros_tableros`
--
ALTER TABLE `miembros_tableros`
  ADD CONSTRAINT `fk_miembros_tablero_tablero` FOREIGN KEY (`tablero_id`) REFERENCES `tableros` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_miembros_tablero_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `tableros`
--
ALTER TABLE `tableros`
  ADD CONSTRAINT `tableros_ibfk_1` FOREIGN KEY (`espacio_trabajo_id`) REFERENCES `espacios_trabajo` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `tableros_ibfk_2` FOREIGN KEY (`creado_por`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `tareas`
--
ALTER TABLE `tareas`
  ADD CONSTRAINT `tareas_ibfk_1` FOREIGN KEY (`estado_id`) REFERENCES `estados_tareas` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `tareas_ibfk_2` FOREIGN KEY (`asignado_a`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `tareas_ibfk_3` FOREIGN KEY (`tablero_id`) REFERENCES `tableros` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
