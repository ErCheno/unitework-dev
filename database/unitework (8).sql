-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 28-04-2025 a las 22:33:36
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
(112, 'Prueba 1', 'hola', 'fb71c138-46f3-4ed7-92f9-6f5a95afabd9', 0, 0, 1, '2025-04-22 17:22:26', '2025-04-28 20:25:56'),
(113, 'Prueba 2', '123', 'fb71c138-46f3-4ed7-92f9-6f5a95afabd9', 0, 0, 1, '2025-04-23 11:23:20', '2025-04-28 20:25:56'),
(114, 'Prueba 3', '1234', 'fb71c138-46f3-4ed7-92f9-6f5a95afabd9', 0, 0, 1, '2025-04-23 11:23:26', '2025-04-28 20:25:56'),
(115, 'Prueba 4', '321', 'fb71c138-46f3-4ed7-92f9-6f5a95afabd9', 0, 0, 1, '2025-04-23 11:23:32', '2025-04-28 20:25:56'),
(116, 'Prueba 5', '321', 'fb71c138-46f3-4ed7-92f9-6f5a95afabd9', 0, 0, 1, '2025-04-23 11:23:39', '2025-04-28 20:25:56'),
(117, 'Prueba 6', 'fsdfsdfsd', 'fb71c138-46f3-4ed7-92f9-6f5a95afabd9', 0, 0, 1, '2025-04-23 11:23:46', '2025-04-28 20:25:56'),
(118, 'Prueba 324432', 'dfsfsddfs', 'fb71c138-46f3-4ed7-92f9-6f5a95afabd9', 0, 0, 1, '2025-04-23 11:23:52', '2025-04-28 20:25:56'),
(123, 'Bomboclat', 'a', 'fb71c138-46f3-4ed7-92f9-6f5a95afabd9', 0, 0, 1, '2025-04-28 07:29:17', '2025-04-28 20:25:56');

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
  `fecha_aceptacion` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
(46, 'fb71c138-46f3-4ed7-92f9-6f5a95afabd9', 112, 'admin'),
(47, 'fb71c138-46f3-4ed7-92f9-6f5a95afabd9', 113, 'admin'),
(48, 'fb71c138-46f3-4ed7-92f9-6f5a95afabd9', 114, 'admin'),
(49, 'fb71c138-46f3-4ed7-92f9-6f5a95afabd9', 115, 'admin'),
(50, 'fb71c138-46f3-4ed7-92f9-6f5a95afabd9', 116, 'admin'),
(51, 'fb71c138-46f3-4ed7-92f9-6f5a95afabd9', 117, 'admin'),
(52, 'fb71c138-46f3-4ed7-92f9-6f5a95afabd9', 118, 'admin'),
(57, 'fb71c138-46f3-4ed7-92f9-6f5a95afabd9', 123, 'admin');

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
(10, 'fb71c138-46f3-4ed7-92f9-6f5a95afabd9', 11, 'admin'),
(11, 'fb71c138-46f3-4ed7-92f9-6f5a95afabd9', 12, 'admin'),
(13, 'fb71c138-46f3-4ed7-92f9-6f5a95afabd9', 14, 'admin'),
(17, 'fb71c138-46f3-4ed7-92f9-6f5a95afabd9', 18, 'admin'),
(21, 'fb71c138-46f3-4ed7-92f9-6f5a95afabd9', 22, 'admin'),
(22, 'fb71c138-46f3-4ed7-92f9-6f5a95afabd9', 23, 'admin'),
(23, 'fb71c138-46f3-4ed7-92f9-6f5a95afabd9', 24, 'admin'),
(24, 'fb71c138-46f3-4ed7-92f9-6f5a95afabd9', 25, 'admin'),
(25, 'fb71c138-46f3-4ed7-92f9-6f5a95afabd9', 26, 'admin'),
(26, 'fb71c138-46f3-4ed7-92f9-6f5a95afabd9', 27, 'admin');

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
(11, 'caca', 'caca', NULL, 'fb71c138-46f3-4ed7-92f9-6f5a95afabd9', '2025-04-23 17:51:26'),
(12, 'caca', 'caca', NULL, 'fb71c138-46f3-4ed7-92f9-6f5a95afabd9', '2025-04-23 17:55:04'),
(14, 'ssadsa', 'dasdas', 112, 'fb71c138-46f3-4ed7-92f9-6f5a95afabd9', '2025-04-23 18:25:31'),
(18, 'Pruebaaaaaaaaaaaaaaaaa', '', 112, 'fb71c138-46f3-4ed7-92f9-6f5a95afabd9', '2025-04-24 15:38:49'),
(22, 'Prueba1 XD', '', 114, 'fb71c138-46f3-4ed7-92f9-6f5a95afabd9', '2025-04-24 16:25:49'),
(23, 'Prueba 2 XD', '', 114, 'fb71c138-46f3-4ed7-92f9-6f5a95afabd9', '2025-04-24 16:26:04'),
(24, 'Pepito 1', '', 116, 'fb71c138-46f3-4ed7-92f9-6f5a95afabd9', '2025-04-24 16:41:54'),
(25, 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', 'asdasdasd', 116, 'fb71c138-46f3-4ed7-92f9-6f5a95afabd9', '2025-04-24 16:42:01'),
(26, 'Caca', '', 112, 'fb71c138-46f3-4ed7-92f9-6f5a95afabd9', '2025-04-25 18:32:32'),
(27, 'ERIJOFSDOIJOIJSDOIJAZXOIJSDOSDOKPASD', '', 112, 'fb71c138-46f3-4ed7-92f9-6f5a95afabd9', '2025-04-25 18:32:50');

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
  `avatar_url` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `usuarios`
--

INSERT INTO `usuarios` (`id`, `nombre`, `email`, `password`, `token`, `fecha_registro`, `avatar_url`) VALUES
('fb71c138-46f3-4ed7-92f9-6f5a95afabd9', 'Emilio', 'emiliojesus786@gmail.com', '$2y$10$hLT5uLANhorZXXtbr3UqOOX39fKY82BDZRa6O3rif8RNl9kLnXcyK', '5db70ac981dfe54deadd6a7f1daf50fe2734eb6e41e6edddf3b67b9f6e9acab1', '2025-04-18 13:40:19', NULL);

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
  ADD KEY `tablero_id` (`tablero_id`);

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
  ADD KEY `usuario_id` (`usuario_id`),
  ADD KEY `espacio_trabajo_id` (`espacio_trabajo_id`);

--
-- Indices de la tabla `miembros_tableros`
--
ALTER TABLE `miembros_tableros`
  ADD PRIMARY KEY (`id`),
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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=125;

--
-- AUTO_INCREMENT de la tabla `estados_tareas`
--
ALTER TABLE `estados_tareas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `invitaciones`
--
ALTER TABLE `invitaciones`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `mapas_mentales`
--
ALTER TABLE `mapas_mentales`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `miembros_espacios_trabajo`
--
ALTER TABLE `miembros_espacios_trabajo`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=59;

--
-- AUTO_INCREMENT de la tabla `miembros_tableros`
--
ALTER TABLE `miembros_tableros`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=27;

--
-- AUTO_INCREMENT de la tabla `tableros`
--
ALTER TABLE `tableros`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=28;

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
  ADD CONSTRAINT `FK_invitaciones_tablero_id` FOREIGN KEY (`tablero_id`) REFERENCES `tableros` (`id`);

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
