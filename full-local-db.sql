--
-- PostgreSQL database dump
--

\restrict NNEMw3dCDKhNTmykv4KxdMv64tYa9bah8TTfdZgGu2MW95nOv5w8FjBm8UJ564c

-- Dumped from database version 18.2
-- Dumped by pg_dump version 18.4

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

ALTER TABLE IF EXISTS ONLY public.campaign_applications DROP CONSTRAINT IF EXISTS fkto7xic5j0vxxwl6xryesdbvsu;
ALTER TABLE IF EXISTS ONLY public.brand_profiles DROP CONSTRAINT IF EXISTS fksj9au0kfjkqbmlqja9q47nilo;
ALTER TABLE IF EXISTS ONLY public.campaigns DROP CONSTRAINT IF EXISTS fkmist22d47q9potxbw7w9ejxvy;
ALTER TABLE IF EXISTS ONLY public.campaign_applications DROP CONSTRAINT IF EXISTS fkgh96i62y8l8269qmfli0d5u9v;
ALTER TABLE IF EXISTS ONLY public.creator_profiles DROP CONSTRAINT IF EXISTS fk48jx3726hqfmcyksfm6rysgw1;
DROP INDEX IF EXISTS public.idx_campaign_applications_coupon_code;
DROP INDEX IF EXISTS public.flyway_schema_history_s_idx;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_pkey;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_email_key;
ALTER TABLE IF EXISTS ONLY public.campaign_applications DROP CONSTRAINT IF EXISTS uk_campaign_applications_campaign_creator;
ALTER TABLE IF EXISTS ONLY public.notifications DROP CONSTRAINT IF EXISTS notifications_pkey;
ALTER TABLE IF EXISTS ONLY public.flyway_schema_history DROP CONSTRAINT IF EXISTS flyway_schema_history_pk;
ALTER TABLE IF EXISTS ONLY public.creator_profiles DROP CONSTRAINT IF EXISTS creator_profiles_user_id_key;
ALTER TABLE IF EXISTS ONLY public.creator_profiles DROP CONSTRAINT IF EXISTS creator_profiles_pkey;
ALTER TABLE IF EXISTS ONLY public.campaigns DROP CONSTRAINT IF EXISTS campaigns_pkey;
ALTER TABLE IF EXISTS ONLY public.campaign_images DROP CONSTRAINT IF EXISTS campaign_images_pkey;
ALTER TABLE IF EXISTS ONLY public.campaign_applications DROP CONSTRAINT IF EXISTS campaign_applications_pkey;
ALTER TABLE IF EXISTS ONLY public.brand_profiles DROP CONSTRAINT IF EXISTS brand_profiles_user_id_key;
ALTER TABLE IF EXISTS ONLY public.brand_profiles DROP CONSTRAINT IF EXISTS brand_profiles_pkey;
DROP TABLE IF EXISTS public.users;
DROP TABLE IF EXISTS public.notifications;
DROP TABLE IF EXISTS public.flyway_schema_history;
DROP TABLE IF EXISTS public.creator_profiles;
DROP TABLE IF EXISTS public.creator_profile_secondary_categories;
DROP TABLE IF EXISTS public.creator_profile_portfolio_links;
DROP TABLE IF EXISTS public.creator_profile_languages;
DROP TABLE IF EXISTS public.campaigns;
DROP TABLE IF EXISTS public.campaign_platforms;
DROP TABLE IF EXISTS public.campaign_images;
DROP TABLE IF EXISTS public.campaign_deliverables;
DROP TABLE IF EXISTS public.campaign_applications;
DROP TABLE IF EXISTS public.brand_profiles;
SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: brand_profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.brand_profiles (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    brand_name character varying(255) NOT NULL,
    category character varying(255),
    description text,
    instagram_handle character varying(255),
    logo_image_url character varying(255),
    website character varying(255)
);


--
-- Name: campaign_applications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.campaign_applications (
    created_at timestamp(6) with time zone NOT NULL,
    updated_at timestamp(6) with time zone NOT NULL,
    campaign_id uuid NOT NULL,
    creator_profile_id uuid NOT NULL,
    id uuid NOT NULL,
    message text,
    status character varying(255) NOT NULL,
    rejection_reason text,
    coupon_code character varying(12),
    coupon_status character varying(20),
    brand_instructions text,
    accepted_at timestamp with time zone,
    rejected_at timestamp with time zone,
    coupon_assigned_at timestamp with time zone,
    coupon_disabled_at timestamp with time zone,
    CONSTRAINT campaign_applications_coupon_status_check CHECK (((coupon_status IS NULL) OR ((coupon_status)::text = ANY ((ARRAY['ACTIVE'::character varying, 'INACTIVE'::character varying])::text[])))),
    CONSTRAINT campaign_applications_status_check CHECK (((status)::text = ANY ((ARRAY['APPLIED'::character varying, 'ACCEPTED'::character varying, 'REJECTED'::character varying, 'WITHDRAWN'::character varying])::text[])))
);


--
-- Name: campaign_deliverables; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.campaign_deliverables (
    campaign_id bigint NOT NULL,
    deliverable character varying(255) NOT NULL
);


--
-- Name: campaign_images; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.campaign_images (
    campaign_id bigint NOT NULL,
    created_at timestamp(6) with time zone NOT NULL,
    id bigint NOT NULL,
    file_path character varying(255) NOT NULL,
    image_url character varying(255) NOT NULL
);


--
-- Name: campaign_images_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.campaign_images ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.campaign_images_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: campaign_platforms; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.campaign_platforms (
    campaign_id bigint NOT NULL,
    platform character varying(255) NOT NULL
);


--
-- Name: campaigns; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.campaigns (
    commission_value numeric(12,2) NOT NULL,
    created_at timestamp(6) with time zone NOT NULL,
    updated_at timestamp(6) with time zone NOT NULL,
    brand_profile_id uuid NOT NULL,
    id uuid NOT NULL,
    category character varying(255),
    commission_type character varying(255) NOT NULL,
    description text,
    product_image_url character varying(255),
    product_name character varying(255) NOT NULL,
    status character varying(255) NOT NULL,
    title character varying(255) NOT NULL,
    CONSTRAINT campaigns_commission_type_check CHECK (((commission_type)::text = ANY ((ARRAY['FIXED'::character varying, 'PERCENTAGE'::character varying])::text[]))),
    CONSTRAINT campaigns_status_check CHECK (((status)::text = ANY ((ARRAY['DRAFT'::character varying, 'LIVE'::character varying, 'ARCHIVED'::character varying])::text[])))
);


--
-- Name: creator_profile_languages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.creator_profile_languages (
    creator_profile_id bigint NOT NULL,
    language character varying(255) NOT NULL
);


--
-- Name: creator_profile_portfolio_links; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.creator_profile_portfolio_links (
    creator_profile_id bigint NOT NULL,
    portfolio_link character varying(255) NOT NULL
);


--
-- Name: creator_profile_secondary_categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.creator_profile_secondary_categories (
    creator_profile_id bigint CONSTRAINT creator_profile_secondary_categorie_creator_profile_id_not_null NOT NULL,
    category character varying(255) NOT NULL
);


--
-- Name: creator_profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.creator_profiles (
    follower_count integer,
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    bio text,
    category character varying(255),
    city character varying(255),
    instagram_handle character varying(255),
    profile_image_url character varying(255)
);


--
-- Name: flyway_schema_history; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.flyway_schema_history (
    installed_rank integer NOT NULL,
    version character varying(50),
    description character varying(200) NOT NULL,
    type character varying(20) NOT NULL,
    script character varying(1000) NOT NULL,
    checksum integer,
    installed_by character varying(100) NOT NULL,
    installed_on timestamp without time zone DEFAULT now() NOT NULL,
    execution_time integer NOT NULL,
    success boolean NOT NULL
);


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notifications (
    id bigint NOT NULL,
    created_at timestamp(6) with time zone NOT NULL,
    message character varying(1000) NOT NULL,
    read boolean NOT NULL,
    related_entity_id bigint,
    related_entity_type character varying(255),
    title character varying(255) NOT NULL,
    type character varying(255) NOT NULL,
    user_id bigint NOT NULL
);


--
-- Name: notifications_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.notifications ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.notifications_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    created_at timestamp(6) with time zone NOT NULL,
    updated_at timestamp(6) with time zone NOT NULL,
    id uuid NOT NULL,
    email character varying(255) NOT NULL,
    name character varying(255) NOT NULL,
    password_hash character varying(255) NOT NULL,
    role character varying(255) NOT NULL,
    CONSTRAINT users_role_check CHECK (((role)::text = ANY ((ARRAY['CREATOR'::character varying, 'BRAND'::character varying, 'ADMIN'::character varying])::text[])))
);


--
-- Data for Name: brand_profiles; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.brand_profiles (id, user_id, brand_name, category, description, instagram_handle, logo_image_url, website) FROM stdin;
a654c156-3ccb-4b55-97c9-9efc0693d373	2e2d8fd8-46bf-428b-a861-dc2f36d69110	BrewBeans Coffee	Food & Beverages	Premium coffee brand offering cold brew, instant coffee sachets, and cafe-style coffee kits for young professionals and students.	brewbeans.coffee	\N	https://brewbeans.example
872dbda4-3eac-4466-a9b3-4e2ad3ccf486	fa6575d2-e204-458e-824f-a2eb8f8dbbc2	GlowVeda Skincare	Beauty & Skincare	Ayurveda-inspired skincare brand creating gentle face serums, moisturizers, and glow routines for everyday skincare.	glowveda.skin	\N	https://glowveda.example
dfa92b25-9e1a-4e5b-917c-9bc71b1ed238	df3704bd-8370-4d10-b355-83c43f5b85ce	FitFuel Nutrition	Fitness & Health	Fitness nutrition brand offering clean snacks, energy bars, and healthy daily routine products.	fitfuel.india	\N	https://fitfuel.example
87e24bc9-500e-4daf-9ad7-ee5715b94e9e	315c0687-6c7f-420f-80a1-cb126cffe3ca	UrbanThread	Fashion & Lifestyle	Casual fashion brand creating everyday streetwear, oversized tees, and lifestyle apparel for young Indian shoppers.	urbanthread.in	\N	https://urbanthread.example
57742c8c-de46-40fa-9b5c-297ce8df0cc7	65742a1b-a192-4139-b830-63972ce7dc2d	Adlier	Food & Beverages	We create best coffees in world	adlier_coffee	https://res.cloudinary.com/dbw0c0mof/image/upload/v1781426614/collabkart/brand-logos/brand-logo-90328017-3fe7-4035-b9cf-b3588095ace9.jpg	www.adlier.com
\.


--
-- Data for Name: campaign_applications; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.campaign_applications (created_at, updated_at, campaign_id, creator_profile_id, id, message, status, rejection_reason, coupon_code, coupon_status, brand_instructions, accepted_at, rejected_at, coupon_assigned_at, coupon_disabled_at) FROM stdin;
2026-06-13 16:28:02.937832+05:30	2026-06-13 16:30:49.284356+05:30	7146dbbc-62e8-4063-a434-e9edad6ffd2d	5c9ec8f2-edaf-4cba-887a-b77c300a071c	35f101c8-3ac6-4ea4-b41f-5327f1b59d29	I make contents based on trading and investments I would like to bid for 200₹	ACCEPTED	\N	\N	\N	\N	\N	\N	\N	\N
2026-06-13 16:40:07.686463+05:30	2026-06-13 16:40:07.686463+05:30	7146dbbc-62e8-4063-a434-e9edad6ffd2d	f49a2291-8de2-41da-9a46-2f2daef43680	65869e9a-c6b6-46c3-aead-daa5fffc83bf	I create content based on singing and would like to charge 200₹	APPLIED	\N	\N	\N	\N	\N	\N	\N	\N
2026-06-13 16:41:18.937434+05:30	2026-06-13 16:42:42.28637+05:30	7146dbbc-62e8-4063-a434-e9edad6ffd2d	ad7245f5-f13a-4508-8e8f-9cc827f602a1	b6df3943-3d8e-44d8-8bc0-3b83d24cae5d	\N	REJECTED	\N	\N	\N	\N	\N	\N	\N	\N
2026-06-13 17:11:24.751836+05:30	2026-06-13 17:13:24.669989+05:30	64639f54-9624-4185-a669-40b970f36b9c	ad7245f5-f13a-4508-8e8f-9cc827f602a1	5d0f43bb-c0b1-4f19-a936-c9341e4b9d0b	I create contents based on Fitness	ACCEPTED	\N	GLVAIS59	INACTIVE	\N	2026-06-13 17:12:19.987334+05:30	\N	2026-06-13 17:12:19.987334+05:30	2026-06-13 17:13:24.65171+05:30
2026-06-14 12:49:16.147968+05:30	2026-06-14 12:49:16.23868+05:30	fdb9b594-79fa-4a23-897b-26aee24eeec3	11a17ed2-1ac9-4082-9806-98ff3cb50db2	f4e394a0-95cd-4ecf-bdd7-c0752383d0f4	QA application from Aarav for coupon lifecycle.	ACCEPTED	\N	QA555672	INACTIVE	Use this code in your reel caption and story.	2026-06-14 12:49:16.208101+05:30	\N	2026-06-14 12:49:16.208101+05:30	2026-06-14 12:49:16.23688+05:30
2026-06-14 12:49:16.166018+05:30	2026-06-14 12:49:16.305985+05:30	fdb9b594-79fa-4a23-897b-26aee24eeec3	f1423645-29a8-43a0-84cc-649410151f2b	7ab76170-7532-499a-a6c3-d9c4a0f8121d	QA application from Nisha for reject flow.	ACCEPTED	\N	QB555672	INACTIVE	should fail archived	2026-06-14 12:49:16.252862+05:30	\N	2026-06-14 12:49:16.252862+05:30	2026-06-14 12:49:16.305455+05:30
2026-06-14 12:50:07.210349+05:30	2026-06-14 12:50:07.379464+05:30	731dd2ae-d29c-430b-8c6d-8718bf77485d	f1423645-29a8-43a0-84cc-649410151f2b	9668ec4e-44af-410b-85b6-24e6672ca1e1	QA application from Nisha for reject flow.	REJECTED	\N	\N	\N	\N	\N	2026-06-14 12:50:07.378604+05:30	\N	\N
2026-06-14 12:50:07.17916+05:30	2026-06-14 12:50:07.408845+05:30	731dd2ae-d29c-430b-8c6d-8718bf77485d	11a17ed2-1ac9-4082-9806-98ff3cb50db2	16e76824-73c4-4668-b3df-b9d7f34e3d1a	QA application from Aarav for coupon lifecycle.	ACCEPTED	\N	QA606277	INACTIVE	Use this code in your reel caption and story.	2026-06-14 12:50:07.263679+05:30	\N	2026-06-14 12:50:07.263679+05:30	2026-06-14 12:50:07.407568+05:30
2026-06-14 12:54:24.877192+05:30	2026-06-14 12:54:24.886736+05:30	a307f4fa-8509-4422-8e71-f6081e941012	577bec43-a402-4ed2-a0d2-85c75136e839	29cd7966-21e0-4250-8f0a-7b0415bbdc8b	Please review me with reason.	REJECTED	Not the right audience fit for this campaign.	\N	\N	\N	\N	2026-06-14 12:54:24.885591+05:30	\N	\N
2026-06-14 12:54:24.928136+05:30	2026-06-14 12:54:24.93816+05:30	69cfc14a-46b6-4bee-900f-944535686d66	1d17f0b8-b7fc-4176-bee2-1bd3a2a87a85	7618302f-8834-4afa-9c2d-f5c231c3de77	Brand one coupon uniqueness test.	ACCEPTED	\N	ZX864321	ACTIVE	Shared coupon brand one.	2026-06-14 12:54:24.937281+05:30	\N	2026-06-14 12:54:24.937281+05:30	\N
2026-06-14 12:54:24.965916+05:30	2026-06-14 12:54:24.9751+05:30	f8ea704b-5007-4c7d-9597-874d64aa280e	6a67645a-1f63-4cc1-8004-bf445fc65b93	8a186c8d-047e-4da2-bcfb-1889fa5e5304	Brand two same coupon test.	ACCEPTED	\N	ZX864321	ACTIVE	Same coupon different brand.	2026-06-14 12:54:24.974096+05:30	\N	2026-06-14 12:54:24.974096+05:30	\N
\.


--
-- Data for Name: campaign_deliverables; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.campaign_deliverables (campaign_id, deliverable) FROM stdin;
1	2 reels
2	2 Reels
3	10 reels
\.


--
-- Data for Name: campaign_images; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.campaign_images (campaign_id, created_at, id, file_path, image_url) FROM stdin;
1	2026-05-08 16:25:01.262643+05:30	1	/Users/akshaylimaye/Documents/CollabKart/backend/uploads/campaign-images/7a4cd2f1-48e5-45d4-b039-0a0dd8d10174.jpg	/uploads/campaign-images/7a4cd2f1-48e5-45d4-b039-0a0dd8d10174.jpg
2	2026-05-08 19:30:44.488324+05:30	2	/Users/akshaylimaye/Documents/CollabKart/backend/uploads/campaign-images/2cc92681-1838-41c6-a267-17d448e4623e.png	/uploads/campaign-images/2cc92681-1838-41c6-a267-17d448e4623e.png
3	2026-05-10 15:43:40.442729+05:30	3	/Users/akshaylimaye/Documents/CollabKart/backend/uploads/campaign-images/771534b0-8829-4951-9a28-2c90e39c7d5c.jpg	/uploads/campaign-images/771534b0-8829-4951-9a28-2c90e39c7d5c.jpg
\.


--
-- Data for Name: campaign_platforms; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.campaign_platforms (campaign_id, platform) FROM stdin;
1	Instagram
2	Instagram
3	Instagram
\.


--
-- Data for Name: campaigns; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.campaigns (commission_value, created_at, updated_at, brand_profile_id, id, category, commission_type, description, product_image_url, product_name, status, title) FROM stdin;
150.00	2026-06-13 12:41:36.247712+05:30	2026-06-13 12:41:36.277715+05:30	57742c8c-de46-40fa-9b5c-297ce8df0cc7	7146dbbc-62e8-4063-a434-e9edad6ffd2d	Food & Beverages	FIXED	We are looking for creators to showcase our strong coffee blend for people who love bold flavour and high-energy mornings. Content can include morning routine, gym pre-workout coffee, or work-from-home setup.	https://res.cloudinary.com/dbw0c0mof/image/upload/v1781426600/collabkart/campaign-images/campaign-image-a12a7742-11bc-493d-9571-db0a57bec79b.jpg	Xpresso Strong Coffee	LIVE	Strong Coffee Challenge
10.00	2026-06-13 12:48:30.908423+05:30	2026-06-13 13:13:32.940471+05:30	a654c156-3ccb-4b55-97c9-9efc0693d373	386cb800-7fb3-483c-9ef5-07fdb788e527	Food & Beverages	PERCENTAGE	Create engaging content around our iced mocha coffee kit. Show how to make cafe-style iced coffee at home in under 2 minutes. Ideal for lifestyle, food, and student creators.	https://res.cloudinary.com/dbw0c0mof/image/upload/v1781426602/collabkart/campaign-images/campaign-image-630b9b41-2bee-4383-8719-5e16aa0aee9f.avif	Iced Mocha Coffee Kit	LIVE	Iced Coffee Summer Drop
12.00	2026-06-13 12:48:30.903946+05:30	2026-06-13 13:10:46.909702+05:30	a654c156-3ccb-4b55-97c9-9efc0693d373	97a97e94-513b-44af-99f0-14c285e7c7f2	Food & Beverages	PERCENTAGE	Promote our new instant cold brew sachets made for busy students and working professionals. Creators should create short-form content showing how quickly the coffee can be prepared at home, office, or while travelling.	https://res.cloudinary.com/dbw0c0mof/image/upload/v1781426603/collabkart/campaign-images/campaign-image-8bd1a611-1f95-47a5-967f-26c5df86a68d.webp	Instant Cold Brew Sachets	LIVE	Monsoon Coffee Launch
14.00	2026-06-13 12:48:31.190933+05:30	2026-06-13 13:17:05.268164+05:30	87e24bc9-500e-4daf-9ad7-ee5715b94e9e	a0a9eeee-5eeb-4f6e-aeba-290671647bf0	Fashion & Lifestyle	PERCENTAGE	Promote our new oversized graphic t-shirt drop through outfit reels, college looks, casual styling, and streetwear content.	https://res.cloudinary.com/dbw0c0mof/image/upload/v1781426604/collabkart/campaign-images/campaign-image-7124fde9-939c-43f0-871b-d60c073217a2.webp	Oversized Graphic T-Shirt	LIVE	Streetwear Drop
150.00	2026-06-13 12:48:30.906517+05:30	2026-06-13 13:12:56.657729+05:30	a654c156-3ccb-4b55-97c9-9efc0693d373	50f88f7a-428b-4d7a-9df4-832bf267faab	Food & Beverages	FIXED	We are looking for creators to showcase our strong coffee blend for people who love bold flavour and high-energy mornings. Content can include morning routine, gym pre-workout coffee, or work-from-home setup.	https://res.cloudinary.com/dbw0c0mof/image/upload/v1781426605/collabkart/campaign-images/campaign-image-4bb16586-1cc4-4596-a987-0085b05aa434.jpg	Xpresso Strong Coffee	LIVE	Strong Coffee Challenge
200.00	2026-06-13 12:48:31.005021+05:30	2026-06-13 13:14:48.318596+05:30	872dbda4-3eac-4466-a9b3-4e2ad3ccf486	eb892e76-30e7-4365-8ce9-d40aca2c48bc	Beauty & Skincare	FIXED	Create content around a simple monsoon skincare routine using our hydrating gel moisturizer. Focus on lightweight, non-sticky, daily skincare.	https://res.cloudinary.com/dbw0c0mof/image/upload/v1781426606/collabkart/campaign-images/campaign-image-86622fa7-9338-48b7-9e89-e8ba19b0a96c.jpg	Hydrating Gel Moisturizer	LIVE	Monsoon Skin Care Routine
12.00	2026-06-14 12:49:16.103434+05:30	2026-06-14 12:49:16.305939+05:30	a654c156-3ccb-4b55-97c9-9efc0693d373	fdb9b594-79fa-4a23-897b-26aee24eeec3	Food & Beverages	PERCENTAGE	QA campaign created by automated local MVP flow test. Safe to archive/delete later.	https://res.cloudinary.com/dbw0c0mof/image/upload/v1781426607/collabkart/campaign-images/campaign-image-b31eb57b-8c76-4963-bf5b-81b100eb8347.png	QA Test Product	ARCHIVED	QA Coupon Flow 1781421555672
12.00	2026-06-13 12:48:31.097863+05:30	2026-06-13 13:15:31.075006+05:30	dfa92b25-9e1a-4e5b-917c-9bc71b1ed238	a6d6bd21-afb9-4496-8440-5ebf89d25f43	Fitness & Health	PERCENTAGE	Promote our protein energy bars as a clean snack for gym-goers, office workers, and students. Content can include gym bag essentials, office snack routine, or pre-workout snack ideas.	https://res.cloudinary.com/dbw0c0mof/image/upload/v1781426607/collabkart/campaign-images/campaign-image-140766ba-8563-49ef-8533-39b99f109bc0.jpg	Protein Energy Bars	LIVE	Healthy Snack Routine
250.00	2026-06-13 12:48:31.192721+05:30	2026-06-13 13:17:43.327711+05:30	87e24bc9-500e-4daf-9ad7-ee5715b94e9e	f4e9c3f1-05df-4331-be55-11843adc5fa1	Fashion & Lifestyle	FIXED	Looking for fashion and lifestyle creators to style our casual co-ord set for weekend outings, cafe looks, and travel content.	https://res.cloudinary.com/dbw0c0mof/image/upload/v1781426608/collabkart/campaign-images/campaign-image-2101dd90-df68-4c11-a36e-ed2ec0b01294.webp	Casual Co-ord Set	LIVE	Weekend Outfit Campaign
180.00	2026-06-13 12:48:31.099707+05:30	2026-06-13 13:16:17.658999+05:30	dfa92b25-9e1a-4e5b-917c-9bc71b1ed238	c0e2f6ae-e1d9-476f-8456-25d107303bc3	Fitness & Health	FIXED	We are looking for fitness and lifestyle creators to showcase our daily nutrition trial pack in routine-based content.	https://res.cloudinary.com/dbw0c0mof/image/upload/v1781426609/collabkart/campaign-images/campaign-image-64055856-8487-48dd-93e5-bdc9f85565af.jpg	Daily Nutrition Trial Pack	LIVE	Fitness Creator Starter Campaign
15.00	2026-06-13 12:48:31.000725+05:30	2026-06-13 17:22:06.905163+05:30	872dbda4-3eac-4466-a9b3-4e2ad3ccf486	64639f54-9624-4185-a669-40b970f36b9c	Beauty & Skincare	PERCENTAGE	Looking for skincare and lifestyle creators to promote our Vitamin C Glow Serum through honest routine-based reels and before-after style content.	https://res.cloudinary.com/dbw0c0mof/image/upload/v1781426610/collabkart/campaign-images/campaign-image-dd0e2552-0ccc-417c-ba35-09efc4b9b236.jpg	Vitamin C Glow Serum	LIVE	Glow Serum Creator Trial
11.00	2026-06-14 12:54:24.908007+05:30	2026-06-14 13:41:54.922707+05:30	a654c156-3ccb-4b55-97c9-9efc0693d373	69cfc14a-46b6-4bee-900f-944535686d66	Food & Beverages	PERCENTAGE	Supplemental QA campaign.	https://res.cloudinary.com/dbw0c0mof/image/upload/v1781426611/collabkart/campaign-images/campaign-image-05cc1929-ff22-4cd4-8018-d44804177491.webp	QA Supplemental Product	LIVE	QA Same Coupon Brand1 1781421864321
11.00	2026-06-14 12:54:24.947518+05:30	2026-06-14 12:54:24.955977+05:30	872dbda4-3eac-4466-a9b3-4e2ad3ccf486	f8ea704b-5007-4c7d-9597-874d64aa280e	Beauty & Skincare	PERCENTAGE	Supplemental QA campaign.	https://res.cloudinary.com/dbw0c0mof/image/upload/v1781426611/collabkart/campaign-images/campaign-image-c343e671-9661-45cf-bfb4-b861141ad850.png	QA Supplemental Product	LIVE	QA Same Coupon Brand2 1781421864321
12.00	2026-06-14 12:50:07.112168+05:30	2026-06-14 12:50:07.408803+05:30	a654c156-3ccb-4b55-97c9-9efc0693d373	731dd2ae-d29c-430b-8c6d-8718bf77485d	Food & Beverages	PERCENTAGE	QA campaign created by automated local MVP flow test. Safe to archive/delete later.	https://res.cloudinary.com/dbw0c0mof/image/upload/v1781426601/collabkart/campaign-images/campaign-image-e87358ce-acfc-4ad7-971e-804cc4d29033.png	QA Test Product	ARCHIVED	QA Coupon Flow 1781421606277
11.00	2026-06-14 12:54:24.858039+05:30	2026-06-14 13:46:20.262514+05:30	a654c156-3ccb-4b55-97c9-9efc0693d373	a307f4fa-8509-4422-8e71-f6081e941012	Food & Beverages	PERCENTAGE	Supplemental QA campaign.	https://res.cloudinary.com/dbw0c0mof/image/upload/v1781424979/collabkart/campaign-images/campaign-image-4d4dd6f4-20bc-491a-b8ce-8fa21bc9a2dc.webp	QA Supplemental Product	LIVE	QA Reject Reason 1781421864321
12.00	2026-06-13 12:39:36.987055+05:30	2026-06-13 12:39:37.052351+05:30	57742c8c-de46-40fa-9b5c-297ce8df0cc7	b3d945ea-19e6-459b-a250-ec668f4409ca	Food & Beverages	PERCENTAGE	Promote our new instant cold brew sachets made for busy students and working professionals. Creators should create a short reel showing how quickly the coffee can be prepared at home, office, or while travelling.	https://res.cloudinary.com/dbw0c0mof/image/upload/v1781426600/collabkart/campaign-images/campaign-image-8a2f6831-13c2-498d-87ab-b042a89a65b9.jpg	Instant Cold Brew Sachets	LIVE	Monsoon Coffee Launch
\.


--
-- Data for Name: creator_profile_languages; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.creator_profile_languages (creator_profile_id, language) FROM stdin;
1	English
1	Hindi
1	Marathi
\.


--
-- Data for Name: creator_profile_portfolio_links; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.creator_profile_portfolio_links (creator_profile_id, portfolio_link) FROM stdin;
\.


--
-- Data for Name: creator_profile_secondary_categories; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.creator_profile_secondary_categories (creator_profile_id, category) FROM stdin;
1	Finance & Investing
\.


--
-- Data for Name: creator_profiles; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.creator_profiles (follower_count, id, user_id, bio, category, city, instagram_handle, profile_image_url) FROM stdin;
1234	6c5de7bf-0f09-4926-a1cc-7cfb2415b2c5	aae46f6e-d6bb-4dd1-91d8-a1cd3a0cf36b	I create fitness, lifestyle, and daily routine content for young working professionals.	Fitness & Health	Pune	vaish_journey	\N
5400	11a17ed2-1ac9-4082-9806-98ff3cb50db2	8949965f-1016-4310-83f8-f26341f891c1	Coffee, cafe, and food content creator sharing simple product-led reels and honest recommendations.	Food & Beverages	Mumbai	aarav.coffee.life	\N
8700	f1423645-29a8-43a0-84cc-649410151f2b	4d0d02c5-0a3c-45ee-a856-ef95aa681b98	Skincare and beauty creator focused on simple routines, affordable products, and honest reviews.	Beauty & Skincare	Bengaluru	nisha.glowdiary	\N
3200	6a67645a-1f63-4cc1-8004-bf445fc65b93	03ad4107-2948-49c4-b106-ff5385a93e43	Fashion and lifestyle creator making outfit reels, streetwear styling videos, and product discovery content.	Fashion & Lifestyle	Delhi	kabir.styles	\N
6100	577bec43-a402-4ed2-a0d2-85c75136e839	85225688-349e-4e81-9635-7e1fdf704b01	Tech and productivity creator sharing apps, gadgets, workflows, and useful digital tools.	Technology	Hyderabad	meera.technotes	\N
4500	1d17f0b8-b7fc-4176-bee2-1bd3a2a87a85	bbb6bc50-77a1-40fb-a4a2-c6697872e5ed	Travel and lifestyle creator sharing budget trips, stays, cafes, and local experiences.	Travel	Pune	rohan.travelbytes	\N
1234	ad7245f5-f13a-4508-8e8f-9cc827f602a1	5c772849-2d8a-4852-8e64-c16bb98c1386	I create contents based on Fitness, Health and Food	Fitness & Health	Pune	vaish_journey	https://res.cloudinary.com/dbw0c0mof/image/upload/v1781426612/collabkart/creator-profiles/creator-profile-5b76ca1d-5e84-4a89-8049-e5dc722ab40c.avif
1234	5c9ec8f2-edaf-4cba-887a-b77c300a071c	008480d1-c6ef-49d0-b8d4-74414213912d	I create content based on finance	Finance & Investing	Banaglore	gg_trader	https://res.cloudinary.com/dbw0c0mof/image/upload/v1781426613/collabkart/creator-profiles/creator-profile-ec48ce0d-b657-4922-a548-f435eecc4654.jpg
2345	f49a2291-8de2-41da-9a46-2f2daef43680	6cf5a195-609a-46bb-bedf-b87227bb7b87	I sing and make reels 	Comedy & Entertainment	Bangalore	madhuraag	https://res.cloudinary.com/dbw0c0mof/image/upload/v1781426613/collabkart/creator-profiles/creator-profile-e3e283cc-6b2d-4c4e-815e-0d56c4613f9f.avif
\.


--
-- Data for Name: flyway_schema_history; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.flyway_schema_history (installed_rank, version, description, type, script, checksum, installed_by, installed_on, execution_time, success) FROM stdin;
1	1	<< Flyway Baseline >>	BASELINE	<< Flyway Baseline >>	\N	postgres	2026-06-12 00:52:51.664727	0	t
2	2	create core entities	SQL	V2__create_core_entities.sql	-63258126	postgres	2026-06-12 00:54:35.512991	23	t
3	3	update campaign statuses for admin review	SQL	V3__update_campaign_statuses_for_admin_review.sql	-2028985758	postgres	2026-06-12 01:09:37.705353	11	t
4	4	restore v1 campaign statuses	SQL	V4__restore_v1_campaign_statuses.sql	-475625848	postgres	2026-06-12 01:41:33.152985	18	t
5	5	add withdrawn application status	SQL	V5__add_withdrawn_application_status.sql	185525373	postgres	2026-06-12 14:15:20.739152	27	t
6	6	add profile image urls	SQL	V6__add_profile_image_urls.sql	-1208500617	postgres	2026-06-13 01:03:03.219405	20	t
7	7	add application review coupon fields	SQL	V7__add_application_review_coupon_fields.sql	444077138	postgres	2026-06-13 17:10:34.518768	35	t
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.notifications (id, created_at, message, read, related_entity_id, related_entity_type, title, type, user_id) FROM stdin;
1	2026-05-08 19:28:54.265933+05:30	Black coffee has been archived by the brand.	t	1	CAMPAIGN	Campaign archived	CAMPAIGN_ARCHIVED	1
2	2026-05-08 19:32:42.006455+05:30	Akshay Limaye applied to Shirt.	t	2	CAMPAIGN_APPLICATION	New campaign application	APPLICATION_RECEIVED	2
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (created_at, updated_at, id, email, name, password_hash, role) FROM stdin;
2026-06-13 12:29:51.590977+05:30	2026-06-13 12:29:51.590977+05:30	5c772849-2d8a-4852-8e64-c16bb98c1386	vaish@gmail.com	Vaishnavi Vaidya	$2a$10$B/aLBYxpeI6Z1bXRMVnvfuLBU1Yhwa7cszGeS/9nRkLLnYoZL02J.	CREATOR
2026-06-13 12:33:44.258878+05:30	2026-06-13 12:33:44.258878+05:30	008480d1-c6ef-49d0-b8d4-74414213912d	gg@gmail.com	Girish Gore	$2a$10$0EbgYHSft2VjKwznsKgb/O2L2vSqiE4az5jooqDrzyaEeyioCX6Wa	CREATOR
2026-06-13 12:35:02.360315+05:30	2026-06-13 12:35:02.360315+05:30	6cf5a195-609a-46bb-bedf-b87227bb7b87	madhura@gmail.com	Madhura	$2a$10$u1go2O7uScykC3fYHTI6weC4r/zomvSZjKF0CBZ4c5bGh3vUbdpOC	CREATOR
2026-06-13 12:36:30.894887+05:30	2026-06-13 12:36:30.894887+05:30	65742a1b-a192-4139-b830-63972ce7dc2d	adlier@gmail.com	Adlier	$2a$10$ck9AXtvqOxZoGW1.fEfRP.Oj2znY9Tw2j4tcj1pHD8Oy578Wzpq9u	BRAND
2026-06-13 12:48:30.869771+05:30	2026-06-13 12:48:30.869771+05:30	2e2d8fd8-46bf-428b-a861-dc2f36d69110	brewbeans.brand@test.com	BrewBeans Coffee	$2a$10$DTo./eiV5l2vQxAc5nczleS.7hOJkORx1B4rM6Tm8s5yv2ZxBTJuW	BRAND
2026-06-13 12:48:30.995789+05:30	2026-06-13 12:48:30.995789+05:30	fa6575d2-e204-458e-824f-a2eb8f8dbbc2	glowveda.brand@test.com	GlowVeda Skincare	$2a$10$u/R8qBLiOAKu6iqp2.D50.joiVTKqHn1og65QibMeV2PQ9Lb6gkcG	BRAND
2026-06-13 12:48:31.091839+05:30	2026-06-13 12:48:31.091839+05:30	df3704bd-8370-4d10-b355-83c43f5b85ce	fitfuel.brand@test.com	FitFuel Nutrition	$2a$10$7nSBN7FqidJCjJtp2F5XYuVg6Luiu8LMHgSrVrVN/nWa48YiKS5lG	BRAND
2026-06-13 12:48:31.186306+05:30	2026-06-13 12:48:31.186306+05:30	315c0687-6c7f-420f-80a1-cb126cffe3ca	urbanthread.brand@test.com	UrbanThread	$2a$10$f8zqyRB.VyG.StDxIvBP9u4.fO.PWUFxGH/AChVrjKxhhOVRAjIW.	BRAND
2026-06-13 12:48:31.283382+05:30	2026-06-13 12:48:31.283382+05:30	aae46f6e-d6bb-4dd1-91d8-a1cd3a0cf36b	vaishnavi.creator@test.com	Vaishnavi Vaidya	$2a$10$97X/t9HaBr31LAzCp8qfiu9bu2HouTFM2KctXTzmI4kwzRRKFXS3S	CREATOR
2026-06-13 12:48:31.378512+05:30	2026-06-13 12:48:31.378512+05:30	8949965f-1016-4310-83f8-f26341f891c1	aarav.creator@test.com	Aarav Mehta	$2a$10$Kl1ayktFiTPc7hAStfwxCOFt7mAjKAhV3YgO3AMjmZeI9myTzaFKK	CREATOR
2026-06-13 12:48:31.468313+05:30	2026-06-13 12:48:31.468313+05:30	4d0d02c5-0a3c-45ee-a856-ef95aa681b98	nisha.creator@test.com	Nisha Sharma	$2a$10$SkT1rHzVtQdjhxUwgp9QeeCN.4fDwi9B91WkdjYvez86AgSAVCYVO	CREATOR
2026-06-13 12:48:31.562618+05:30	2026-06-13 12:48:31.562618+05:30	03ad4107-2948-49c4-b106-ff5385a93e43	kabir.creator@test.com	Kabir Rao	$2a$10$AavNDOqUGdW4eEAXvHvjcuA.mmAXwqCx5q4YuOvbT1CRB./2sw6CK	CREATOR
2026-06-13 12:48:31.653177+05:30	2026-06-13 12:48:31.653177+05:30	85225688-349e-4e81-9635-7e1fdf704b01	meera.creator@test.com	Meera Iyer	$2a$10$KdelSJ6olgYcClLa5e0MlOxPo3mj4shqZJEzUL.efAFSys4J7uM/q	CREATOR
2026-06-13 12:48:31.744853+05:30	2026-06-13 12:48:31.744853+05:30	bbb6bc50-77a1-40fb-a4a2-c6697872e5ed	rohan.creator@test.com	Rohan Patil	$2a$10$DbQy/XIQ9Qu7Kat42ZByP.FkHA9jpGbg9spBljXFZgs/WpoJWphda	CREATOR
2026-06-13 12:48:31.852125+05:30	2026-06-13 12:48:31.852125+05:30	a350860e-8a62-412c-9662-32476a9ef570	admin@collabkart.local	Dev Admin	$2a$10$581h4n7NeH/FV4puiaj5kuYtwWRvBPGRh4iZFt.ugkmsZuNhqeQpe	ADMIN
\.


--
-- Name: campaign_images_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.campaign_images_id_seq', 3, true);


--
-- Name: notifications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.notifications_id_seq', 2, true);


--
-- Name: brand_profiles brand_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.brand_profiles
    ADD CONSTRAINT brand_profiles_pkey PRIMARY KEY (id);


--
-- Name: brand_profiles brand_profiles_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.brand_profiles
    ADD CONSTRAINT brand_profiles_user_id_key UNIQUE (user_id);


--
-- Name: campaign_applications campaign_applications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.campaign_applications
    ADD CONSTRAINT campaign_applications_pkey PRIMARY KEY (id);


--
-- Name: campaign_images campaign_images_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.campaign_images
    ADD CONSTRAINT campaign_images_pkey PRIMARY KEY (id);


--
-- Name: campaigns campaigns_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.campaigns
    ADD CONSTRAINT campaigns_pkey PRIMARY KEY (id);


--
-- Name: creator_profiles creator_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.creator_profiles
    ADD CONSTRAINT creator_profiles_pkey PRIMARY KEY (id);


--
-- Name: creator_profiles creator_profiles_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.creator_profiles
    ADD CONSTRAINT creator_profiles_user_id_key UNIQUE (user_id);


--
-- Name: flyway_schema_history flyway_schema_history_pk; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.flyway_schema_history
    ADD CONSTRAINT flyway_schema_history_pk PRIMARY KEY (installed_rank);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: campaign_applications uk_campaign_applications_campaign_creator; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.campaign_applications
    ADD CONSTRAINT uk_campaign_applications_campaign_creator UNIQUE (campaign_id, creator_profile_id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: flyway_schema_history_s_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX flyway_schema_history_s_idx ON public.flyway_schema_history USING btree (success);


--
-- Name: idx_campaign_applications_coupon_code; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_campaign_applications_coupon_code ON public.campaign_applications USING btree (coupon_code);


--
-- Name: creator_profiles fk48jx3726hqfmcyksfm6rysgw1; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.creator_profiles
    ADD CONSTRAINT fk48jx3726hqfmcyksfm6rysgw1 FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: campaign_applications fkgh96i62y8l8269qmfli0d5u9v; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.campaign_applications
    ADD CONSTRAINT fkgh96i62y8l8269qmfli0d5u9v FOREIGN KEY (campaign_id) REFERENCES public.campaigns(id);


--
-- Name: campaigns fkmist22d47q9potxbw7w9ejxvy; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.campaigns
    ADD CONSTRAINT fkmist22d47q9potxbw7w9ejxvy FOREIGN KEY (brand_profile_id) REFERENCES public.brand_profiles(id);


--
-- Name: brand_profiles fksj9au0kfjkqbmlqja9q47nilo; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.brand_profiles
    ADD CONSTRAINT fksj9au0kfjkqbmlqja9q47nilo FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: campaign_applications fkto7xic5j0vxxwl6xryesdbvsu; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.campaign_applications
    ADD CONSTRAINT fkto7xic5j0vxxwl6xryesdbvsu FOREIGN KEY (creator_profile_id) REFERENCES public.creator_profiles(id);


--
-- PostgreSQL database dump complete
--

\unrestrict NNEMw3dCDKhNTmykv4KxdMv64tYa9bah8TTfdZgGu2MW95nOv5w8FjBm8UJ564c

