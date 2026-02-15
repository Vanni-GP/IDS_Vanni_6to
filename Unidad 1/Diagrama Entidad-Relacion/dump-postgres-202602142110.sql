--
-- PostgreSQL database dump
--

-- Dumped from database version 17.2
-- Dumped by pg_dump version 17.0

-- Started on 2026-02-14 21:10:54

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 222 (class 1259 OID 90180)
-- Name: acceso; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.acceso (
    id_acceso integer NOT NULL,
    id_vehiculo integer NOT NULL,
    fecha_entrada timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    fecha_salida timestamp without time zone,
    estado character varying(20) DEFAULT 'ACTIVO'::character varying NOT NULL
);


ALTER TABLE public.acceso OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 90179)
-- Name: acceso_id_acceso_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.acceso_id_acceso_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.acceso_id_acceso_seq OWNER TO postgres;

--
-- TOC entry 4887 (class 0 OID 0)
-- Dependencies: 221
-- Name: acceso_id_acceso_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.acceso_id_acceso_seq OWNED BY public.acceso.id_acceso;


--
-- TOC entry 224 (class 1259 OID 90193)
-- Name: codigo_qr; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.codigo_qr (
    id_qr integer NOT NULL,
    codigo character varying(255) NOT NULL,
    fecha_generacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    estado character varying(20) NOT NULL,
    id_vehiculo integer NOT NULL
);


ALTER TABLE public.codigo_qr OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 90192)
-- Name: codigo_qr_id_qr_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.codigo_qr_id_qr_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.codigo_qr_id_qr_seq OWNER TO postgres;

--
-- TOC entry 4888 (class 0 OID 0)
-- Dependencies: 223
-- Name: codigo_qr_id_qr_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.codigo_qr_id_qr_seq OWNED BY public.codigo_qr.id_qr;


--
-- TOC entry 218 (class 1259 OID 90158)
-- Name: usuario; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.usuario (
    id_usuario integer NOT NULL,
    nombre character varying(100) NOT NULL,
    correo character varying(150) NOT NULL,
    "contraseña" character varying(255) NOT NULL,
    rol character varying(50) NOT NULL,
    fecha_registro timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.usuario OWNER TO postgres;

--
-- TOC entry 217 (class 1259 OID 90157)
-- Name: usuario_id_usuario_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.usuario_id_usuario_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.usuario_id_usuario_seq OWNER TO postgres;

--
-- TOC entry 4889 (class 0 OID 0)
-- Dependencies: 217
-- Name: usuario_id_usuario_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.usuario_id_usuario_seq OWNED BY public.usuario.id_usuario;


--
-- TOC entry 220 (class 1259 OID 90168)
-- Name: vehiculo; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.vehiculo (
    id_vehiculo integer NOT NULL,
    placa character varying(20) NOT NULL,
    modelo character varying(100) NOT NULL,
    color character varying(50) NOT NULL,
    id_usuario integer NOT NULL
);


ALTER TABLE public.vehiculo OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 90167)
-- Name: vehiculo_id_vehiculo_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.vehiculo_id_vehiculo_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.vehiculo_id_vehiculo_seq OWNER TO postgres;

--
-- TOC entry 4890 (class 0 OID 0)
-- Dependencies: 219
-- Name: vehiculo_id_vehiculo_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.vehiculo_id_vehiculo_seq OWNED BY public.vehiculo.id_vehiculo;


--
-- TOC entry 4713 (class 2604 OID 90183)
-- Name: acceso id_acceso; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.acceso ALTER COLUMN id_acceso SET DEFAULT nextval('public.acceso_id_acceso_seq'::regclass);


--
-- TOC entry 4716 (class 2604 OID 90196)
-- Name: codigo_qr id_qr; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.codigo_qr ALTER COLUMN id_qr SET DEFAULT nextval('public.codigo_qr_id_qr_seq'::regclass);


--
-- TOC entry 4710 (class 2604 OID 90161)
-- Name: usuario id_usuario; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuario ALTER COLUMN id_usuario SET DEFAULT nextval('public.usuario_id_usuario_seq'::regclass);


--
-- TOC entry 4712 (class 2604 OID 90171)
-- Name: vehiculo id_vehiculo; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vehiculo ALTER COLUMN id_vehiculo SET DEFAULT nextval('public.vehiculo_id_vehiculo_seq'::regclass);


--
-- TOC entry 4879 (class 0 OID 90180)
-- Dependencies: 222
-- Data for Name: acceso; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.acceso (id_acceso, id_vehiculo, fecha_entrada, fecha_salida, estado) FROM stdin;
\.


--
-- TOC entry 4881 (class 0 OID 90193)
-- Dependencies: 224
-- Data for Name: codigo_qr; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.codigo_qr (id_qr, codigo, fecha_generacion, estado, id_vehiculo) FROM stdin;
\.


--
-- TOC entry 4875 (class 0 OID 90158)
-- Dependencies: 218
-- Data for Name: usuario; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.usuario (id_usuario, nombre, correo, "contraseña", rol, fecha_registro) FROM stdin;
\.


--
-- TOC entry 4877 (class 0 OID 90168)
-- Dependencies: 220
-- Data for Name: vehiculo; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.vehiculo (id_vehiculo, placa, modelo, color, id_usuario) FROM stdin;
\.


--
-- TOC entry 4891 (class 0 OID 0)
-- Dependencies: 221
-- Name: acceso_id_acceso_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.acceso_id_acceso_seq', 1, false);


--
-- TOC entry 4892 (class 0 OID 0)
-- Dependencies: 223
-- Name: codigo_qr_id_qr_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.codigo_qr_id_qr_seq', 1, false);


--
-- TOC entry 4893 (class 0 OID 0)
-- Dependencies: 217
-- Name: usuario_id_usuario_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.usuario_id_usuario_seq', 1, false);


--
-- TOC entry 4894 (class 0 OID 0)
-- Dependencies: 219
-- Name: vehiculo_id_vehiculo_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.vehiculo_id_vehiculo_seq', 1, false);


--
-- TOC entry 4723 (class 2606 OID 90185)
-- Name: acceso acceso_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.acceso
    ADD CONSTRAINT acceso_pk PRIMARY KEY (id_acceso);


--
-- TOC entry 4725 (class 2606 OID 90199)
-- Name: codigo_qr codigo_qr_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.codigo_qr
    ADD CONSTRAINT codigo_qr_pk PRIMARY KEY (id_qr);


--
-- TOC entry 4719 (class 2606 OID 90166)
-- Name: usuario usuario_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuario
    ADD CONSTRAINT usuario_pk PRIMARY KEY (id_usuario);


--
-- TOC entry 4721 (class 2606 OID 90173)
-- Name: vehiculo vehiculo_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vehiculo
    ADD CONSTRAINT vehiculo_pk PRIMARY KEY (id_vehiculo);


--
-- TOC entry 4727 (class 2606 OID 90187)
-- Name: acceso acceso_vehiculo_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.acceso
    ADD CONSTRAINT acceso_vehiculo_fk FOREIGN KEY (id_vehiculo) REFERENCES public.vehiculo(id_vehiculo);


--
-- TOC entry 4728 (class 2606 OID 90200)
-- Name: codigo_qr codigo_qr_vehiculo_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.codigo_qr
    ADD CONSTRAINT codigo_qr_vehiculo_fk FOREIGN KEY (id_vehiculo) REFERENCES public.vehiculo(id_vehiculo);


--
-- TOC entry 4726 (class 2606 OID 90174)
-- Name: vehiculo vehiculo_usuario_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vehiculo
    ADD CONSTRAINT vehiculo_usuario_fk FOREIGN KEY (id_usuario) REFERENCES public.usuario(id_usuario);


-- Completed on 2026-02-14 21:10:54

--
-- PostgreSQL database dump complete
--

