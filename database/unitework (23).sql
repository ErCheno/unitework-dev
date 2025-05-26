-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 27-05-2025 a las 00:15:01
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
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `ultima_actividad` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `espacios_trabajo`
--

INSERT INTO `espacios_trabajo` (`id`, `nombre`, `descripcion`, `creado_por`, `fecha_creacion`, `ultima_actividad`) VALUES
(240, 'Espacio de Saray', '', 'c0344738-ef58-4742-8ba4-14cdd43abc8f', '2025-05-26 21:44:58', '2025-05-26 21:47:52');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `estados_tareas`
--

CREATE TABLE `estados_tareas` (
  `id` int(11) NOT NULL,
  `nombre` varchar(50) NOT NULL,
  `creado_por` char(36) DEFAULT NULL,
  `tablero_id` int(11) DEFAULT NULL,
  `posicionamiento` int(11) NOT NULL,
  `color` varchar(7) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `estados_tareas`
--

INSERT INTO `estados_tareas` (`id`, `nombre`, `creado_por`, `tablero_id`, `posicionamiento`, `color`) VALUES
(367, 'Por hacer', 'c0344738-ef58-4742-8ba4-14cdd43abc8f', 232, 1, NULL),
(368, 'En progreso', 'c0344738-ef58-4742-8ba4-14cdd43abc8f', 232, 2, NULL),
(369, 'Hecho', 'c0344738-ef58-4742-8ba4-14cdd43abc8f', 232, 3, NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `invitaciones`
--

CREATE TABLE `invitaciones` (
  `id` int(11) NOT NULL,
  `email` varchar(100) NOT NULL,
  `espacio_trabajo_id` int(11) DEFAULT NULL,
  `tablero_id` int(11) DEFAULT NULL,
  `estado` enum('pendiente','aceptada','rechazada') DEFAULT 'pendiente',
  `token` varchar(255) NOT NULL,
  `fecha_envio` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_aceptacion` timestamp NULL DEFAULT NULL,
  `fecha_expiracion` datetime DEFAULT NULL,
  `remitente_id` char(36) NOT NULL,
  `mapa_id` int(11) DEFAULT NULL,
  `rol` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `invitaciones`
--

INSERT INTO `invitaciones` (`id`, `email`, `espacio_trabajo_id`, `tablero_id`, `estado`, `token`, `fecha_envio`, `fecha_aceptacion`, `fecha_expiracion`, `remitente_id`, `mapa_id`, `rol`) VALUES
(190, 'emiliojesus786@gmail.com', 240, NULL, 'aceptada', '6ffdff18b6c45e98635908cfdf440b005d98335d66bfcecf2c4387367b2039a2', '2025-05-26 21:48:26', '2025-05-26 21:48:34', '2025-06-02 23:48:26', 'c0344738-ef58-4742-8ba4-14cdd43abc8f', 65, 'Miembro');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `mapas_mentales`
--

CREATE TABLE `mapas_mentales` (
  `id` int(11) NOT NULL,
  `titulo` varchar(100) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `espacio_trabajo_id` int(11) DEFAULT NULL,
  `creado_por` char(36) NOT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_modificacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `color` varchar(7) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `mapas_mentales`
--

INSERT INTO `mapas_mentales` (`id`, `titulo`, `descripcion`, `espacio_trabajo_id`, `creado_por`, `fecha_creacion`, `fecha_modificacion`, `color`) VALUES
(65, 'Mapa mental', '', 240, 'c0344738-ef58-4742-8ba4-14cdd43abc8f', '2025-05-26 21:45:11', '2025-05-26 21:45:11', '#95a9df');

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
(264, 'c0344738-ef58-4742-8ba4-14cdd43abc8f', 240, 'admin'),
(269, '5f1e4884-7fa6-4ebf-b6d0-5cc2bf43a23e', 240, 'miembro');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `miembros_mapas_mentales`
--

CREATE TABLE `miembros_mapas_mentales` (
  `id` int(11) NOT NULL,
  `usuario_id` char(36) NOT NULL,
  `mapa_mental_id` int(11) NOT NULL,
  `rol` enum('admin','miembro') NOT NULL DEFAULT 'miembro'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `miembros_mapas_mentales`
--

INSERT INTO `miembros_mapas_mentales` (`id`, `usuario_id`, `mapa_mental_id`, `rol`) VALUES
(75, 'c0344738-ef58-4742-8ba4-14cdd43abc8f', 65, 'admin'),
(77, '5f1e4884-7fa6-4ebf-b6d0-5cc2bf43a23e', 65, 'miembro');

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
(303, 'c0344738-ef58-4742-8ba4-14cdd43abc8f', 232, 'admin');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `nodos_mapa`
--

CREATE TABLE `nodos_mapa` (
  `id` int(11) NOT NULL,
  `mapa_id` int(11) NOT NULL,
  `contenido` text NOT NULL,
  `padre_id` int(11) DEFAULT NULL,
  `orden` int(11) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `nodos_mapa`
--

INSERT INTO `nodos_mapa` (`id`, `mapa_id`, `contenido`, `padre_id`, `orden`) VALUES
(897, 65, 'Nodo raíz', NULL, 0),
(898, 65, 'Hijo 1', 897, 0),
(899, 65, 'Hijo 2', 897, 1),
(900, 65, 'Hijo 3', 897, 2);

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
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `ultima_actividad` datetime DEFAULT current_timestamp(),
  `color` varchar(7) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `tableros`
--

INSERT INTO `tableros` (`id`, `nombre`, `descripcion`, `espacio_trabajo_id`, `creado_por`, `fecha_creacion`, `ultima_actividad`, `color`) VALUES
(232, 'Tablero 1', '', 240, 'c0344738-ef58-4742-8ba4-14cdd43abc8f', '2025-05-26 22:06:23', '2025-05-27 00:06:23', '#8fc7e0');

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
  `fecha_creacion` datetime NOT NULL DEFAULT current_timestamp(),
  `fecha_limite` date DEFAULT NULL,
  `orden` int(11) NOT NULL DEFAULT 0,
  `prioridad` enum('baja','media','alta') NOT NULL DEFAULT 'media',
  `color` varchar(10) DEFAULT NULL
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
('031f0c0b-3fac-414c-afc8-a17b418f0a63', 'Mark', 'mark@gmail.com', '$2y$10$D8mduC4n.jMShPuqdLHXNuCW5GBPMxCJjRkVBYuRuJsLrkt4qdFaq', '7c892dbc5a913cc4ba53b574011deb494eedcc581f3511e0705dba2d9dd8e34b', '2025-05-02 17:26:36', 'default-avatar.png', '2025-05-06 00:08:11'),
('1490cb3d-659b-4077-b545-667fe43feef4', 'Vanessa', 'vanessa@gmail.com', '$2y$10$wMDaPWdSNwV2dwShcM3Hxethakn86QmZJcxadEghrhzqxUgwmpfsK', '935061bffa0a0ece913428a31ba6523f2a9c4cdd4d49f4e9cf05b8488b8a5c40', '2025-05-23 18:54:32', 'avatar_6830c476f22b4.png', '2025-05-26 08:15:27'),
('4324a35e-3175-437f-862b-d8b522680612', 'Marina', 'marina@gmail.com', '$2y$10$DDVbQ26Ly84ddmDqFbekAe/by1WLEqivWQGdDQWUlUc7bw8dpUhwe', '9f148f9b05e33a90d8998f6f47dbd4c4e1c2107ca9554fcb32efeadaffc56dbe', '2025-05-06 15:57:17', 'default-avatar.png', '2025-05-07 06:03:19'),
('5f1e4884-7fa6-4ebf-b6d0-5cc2bf43a23e', 'Emilio', 'emiliojesus786@gmail.com', '$2y$10$IuFgkaovFPtCxZf0fd/iE.OrNOlciCxrD.fUq0negoD0Y3AaKg0Cq', 'ee4bc9f5e8c21bf9f4d7d8984927603991ec3d2011c5c4eeeff831ba697fa3e2', '2025-05-02 12:30:12', 'avatar_6814baf25bd1a.jpg', '2025-05-27 11:57:39'),
('792cc5ba-2bca-4869-8c78-39cbe4c0f49f', 'PruebaPotato', 'pruebapotato@gmail.com', '$2y$10$r9T1MM21RdlTQMveR4Z6Z..7nCHVS0aYFO69O/2cssJYPDqeTi3BG', '7a423749627369902f72ab72259c261bbfce5b53d2beee2b680a455fc138c5b0', '2025-05-25 18:08:33', 'avatar_68335cbe12d4d.jpg', '2025-05-26 08:08:49'),
('7e1bedd6-3e02-4ec5-a3b0-d308b27376ac', 'Firu', 'firulais@gmail.com', '$2y$10$PX1mpqsknF0JWnDW8SMDeuyjSPTZrokQ32swJLDOwvHqpmRH1Y6fG', '67ac8bf809125451c065d41cb31c11d55a605541118d38acce7196503610c818', '2025-05-24 18:46:50', 'avatar_683214d0633b0.png', '2025-05-25 08:46:54'),
('988014e9-908c-46c0-8508-faf101ad53a0', 'Adrian', 'adrian@gmail.com', '$2y$10$03teRUCGmMa5vXzpUoXjXep5mTZI.ou9M4/AlpvJ3mI/co218q/FC', '8a49d8f2923fc54204ca8471091510a2888d54e2269cc63ac595718b95a04253', '2025-05-23 16:58:56', 'avatar_6830a99ec44d8.gif', '2025-05-24 08:56:21'),
('a023cf90-75d5-4e18-8ded-f64fa0a01c96', 'Alvaro', 'alvaro@gmail.com', '$2y$10$lGVNj3xxAqzofloJUPF/1.oo2ERaTmdOlvdALUEkBN3/qnv/QBYua', 'b036e5d71c310e4c56cc51f8bc89777dd08db77dd39b527379922b63c791a03e', '2025-05-24 09:57:02', 'avatar_6832073c6ad08.jpg', '2025-05-25 07:44:29'),
('b0c6e733-d0de-4adb-bb0b-7653cd61ac50', 'Alexei', 'alexei@gmail.com', '$2y$10$7koxkAcPLlWYy4t7KvEe1.wwUoBsw9SMf8gDZmsiXkpmw8ij3//y.', 'a93960f3c1452520afbe1177db956b2bd176674e7c93e96b4898029a81442de1', '2025-05-24 10:43:40', 'avatar_6831a35e76369.png', '2025-05-25 00:44:27'),
('c0344738-ef58-4742-8ba4-14cdd43abc8f', 'Saray', 'saray@gmail.com', '$2y$10$hPN3CqnpmdwLLVmmn4dZi.7spYDxBeX5S.pXEOFobuTQYfFsOI3Be', '0ca3b7fc1f2c507279a57f35ada83bf984a33ba4b52489921d4559b7b13c9ad7', '2025-05-03 10:47:56', 'avatar_681a3d71e6481.gif', '2025-05-27 12:02:04'),
('cb78139f-43d3-480e-b3a5-3fdc7d2a9867', 'Miguel', 'miguel@gmail.com', '$2y$10$S6pYrMiSed/Z6goLWZdEMOW91yymnDf6e0BOtGRvKjaXcGzS2r/v6', 'ebae87f074173aa4fc91c7dd67e621dc5a8835cf241a12d48d29016a3e3f732d', '2025-05-02 12:33:12', 'avatar_6814bcf8dc4a8.jpeg', '2025-05-05 21:55:26');

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
  ADD KEY `creado_por` (`creado_por`),
  ADD KEY `FK_estado_tareas_tablero_id` (`tablero_id`);

--
-- Indices de la tabla `invitaciones`
--
ALTER TABLE `invitaciones`
  ADD PRIMARY KEY (`id`),
  ADD KEY `espacio_trabajo_id` (`espacio_trabajo_id`),
  ADD KEY `tablero_id` (`tablero_id`),
  ADD KEY `fk_remitente` (`remitente_id`),
  ADD KEY `fk_invitaciones_mapa` (`mapa_id`);

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
-- Indices de la tabla `miembros_mapas_mentales`
--
ALTER TABLE `miembros_mapas_mentales`
  ADD PRIMARY KEY (`id`),
  ADD KEY `mapa_mental_id` (`mapa_mental_id`),
  ADD KEY `idx_usuario_mapa` (`usuario_id`,`mapa_mental_id`);

--
-- Indices de la tabla `miembros_tableros`
--
ALTER TABLE `miembros_tableros`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `usuario_id_2` (`usuario_id`,`tablero_id`),
  ADD KEY `usuario_id` (`usuario_id`),
  ADD KEY `tablero_id` (`tablero_id`);

--
-- Indices de la tabla `nodos_mapa`
--
ALTER TABLE `nodos_mapa`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_nodo_mapa_mapa` (`mapa_id`),
  ADD KEY `fk_nodo_mapa_padre` (`padre_id`);

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
  ADD KEY `asignado_a` (`asignado_a`);

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=247;

--
-- AUTO_INCREMENT de la tabla `estados_tareas`
--
ALTER TABLE `estados_tareas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=376;

--
-- AUTO_INCREMENT de la tabla `invitaciones`
--
ALTER TABLE `invitaciones`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=191;

--
-- AUTO_INCREMENT de la tabla `mapas_mentales`
--
ALTER TABLE `mapas_mentales`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=66;

--
-- AUTO_INCREMENT de la tabla `miembros_espacios_trabajo`
--
ALTER TABLE `miembros_espacios_trabajo`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=277;

--
-- AUTO_INCREMENT de la tabla `miembros_mapas_mentales`
--
ALTER TABLE `miembros_mapas_mentales`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=78;

--
-- AUTO_INCREMENT de la tabla `miembros_tableros`
--
ALTER TABLE `miembros_tableros`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=306;

--
-- AUTO_INCREMENT de la tabla `nodos_mapa`
--
ALTER TABLE `nodos_mapa`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=901;

--
-- AUTO_INCREMENT de la tabla `tableros`
--
ALTER TABLE `tableros`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=235;

--
-- AUTO_INCREMENT de la tabla `tareas`
--
ALTER TABLE `tareas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=220;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `estados_tareas`
--
ALTER TABLE `estados_tareas`
  ADD CONSTRAINT `FK_estado_tareas_tablero_id` FOREIGN KEY (`tablero_id`) REFERENCES `tableros` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `estados_tareas_ibfk_1` FOREIGN KEY (`creado_por`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL;

--
-- Filtros para la tabla `invitaciones`
--
ALTER TABLE `invitaciones`
  ADD CONSTRAINT `FK_invitaciones_espacio_trabajo_id` FOREIGN KEY (`espacio_trabajo_id`) REFERENCES `espacios_trabajo` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `FK_invitaciones_tablero_id` FOREIGN KEY (`tablero_id`) REFERENCES `tableros` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_invitaciones_mapa` FOREIGN KEY (`mapa_id`) REFERENCES `mapas_mentales` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_remitente` FOREIGN KEY (`remitente_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `mapas_mentales`
--
ALTER TABLE `mapas_mentales`
  ADD CONSTRAINT `mapas_mentales_ibfk_1` FOREIGN KEY (`espacio_trabajo_id`) REFERENCES `espacios_trabajo` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `mapas_mentales_ibfk_2` FOREIGN KEY (`creado_por`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `miembros_espacios_trabajo`
--
ALTER TABLE `miembros_espacios_trabajo`
  ADD CONSTRAINT `fk_miembros_espacio` FOREIGN KEY (`espacio_trabajo_id`) REFERENCES `espacios_trabajo` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_miembros_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `miembros_mapas_mentales`
--
ALTER TABLE `miembros_mapas_mentales`
  ADD CONSTRAINT `miembros_mapas_mentales_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `miembros_mapas_mentales_ibfk_2` FOREIGN KEY (`mapa_mental_id`) REFERENCES `mapas_mentales` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `miembros_tableros`
--
ALTER TABLE `miembros_tableros`
  ADD CONSTRAINT `fk_miembros_tablero_tablero` FOREIGN KEY (`tablero_id`) REFERENCES `tableros` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_miembros_tablero_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `nodos_mapa`
--
ALTER TABLE `nodos_mapa`
  ADD CONSTRAINT `fk_nodo_mapa_mapa` FOREIGN KEY (`mapa_id`) REFERENCES `mapas_mentales` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_nodo_mapa_padre` FOREIGN KEY (`padre_id`) REFERENCES `nodos_mapa` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `nodos_mapa_ibfk_1` FOREIGN KEY (`mapa_id`) REFERENCES `mapas_mentales` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `nodos_mapa_ibfk_2` FOREIGN KEY (`padre_id`) REFERENCES `nodos_mapa` (`id`) ON DELETE CASCADE;

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
  ADD CONSTRAINT `tareas_ibfk_2` FOREIGN KEY (`asignado_a`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
