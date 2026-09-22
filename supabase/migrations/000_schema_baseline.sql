


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE SCHEMA IF NOT EXISTS "public";


ALTER SCHEMA "public" OWNER TO "pg_database_owner";


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE OR REPLACE FUNCTION "public"."convite_por_token"("p_token" "text") RETURNS TABLE("id" "uuid", "crianca_id" "uuid", "criado_por" "uuid", "vinculo" "text", "papel" "text", "usado" boolean, "expires_at" timestamp with time zone, "crianca_nome" "text")
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  select c.id, c.crianca_id, c.criado_por, c.vinculo, c.papel,
         c.usado, c.expires_at, cr.nome
  from convites c
  join criancas cr on cr.id = c.crianca_id
  where c.token = p_token
  limit 1
$$;


ALTER FUNCTION "public"."convite_por_token"("p_token" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."criar_crianca_com_responsavel"("p_nome" "text", "p_data_nascimento" "date", "p_emoji" "text" DEFAULT '🧒'::"text", "p_tipo_sanguineo" "text" DEFAULT NULL::"text", "p_alergias" "text" DEFAULT NULL::"text", "p_medicamentos" "text" DEFAULT NULL::"text", "p_pediatra" "text" DEFAULT NULL::"text", "p_pediatra_telefone" "text" DEFAULT NULL::"text", "p_escola" "text" DEFAULT NULL::"text", "p_serie" "text" DEFAULT NULL::"text", "p_periodo" "text" DEFAULT NULL::"text", "p_professora" "text" DEFAULT NULL::"text", "p_nome_responsavel" "text" DEFAULT ''::"text", "p_vinculo" "text" DEFAULT ''::"text") RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  v_crianca_id uuid;
begin
  -- cria a criança
  insert into criancas (
    nome, data_nascimento, emoji, tipo_sanguineo, alergias,
    medicamentos, pediatra, pediatra_telefone, escola, serie, periodo, professora
  ) values (
    p_nome, p_data_nascimento, coalesce(p_emoji,'🧒'), p_tipo_sanguineo, p_alergias,
    p_medicamentos, p_pediatra, p_pediatra_telefone, p_escola, p_serie, p_periodo, p_professora
  )
  returning id into v_crianca_id;

  -- cria o vínculo do responsável principal
  insert into membros_familia (
    crianca_id, user_id, nome, vinculo, papel, ativo
  ) values (
    v_crianca_id, auth.uid(), p_nome_responsavel, p_vinculo, 'responsavel_principal', true
  );

  return v_crianca_id;
end;
$$;


ALTER FUNCTION "public"."criar_crianca_com_responsavel"("p_nome" "text", "p_data_nascimento" "date", "p_emoji" "text", "p_tipo_sanguineo" "text", "p_alergias" "text", "p_medicamentos" "text", "p_pediatra" "text", "p_pediatra_telefone" "text", "p_escola" "text", "p_serie" "text", "p_periodo" "text", "p_professora" "text", "p_nome_responsavel" "text", "p_vinculo" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."minhas_criancas"() RETURNS SETOF "uuid"
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  select crianca_id
  from membros_familia
  where user_id = auth.uid() and ativo = true
$$;


ALTER FUNCTION "public"."minhas_criancas"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."nomes_membros_familia"("p_crianca_id" "uuid") RETURNS TABLE("user_id" "uuid", "nome" "text")
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
    select mf.user_id, coalesce(u.raw_user_meta_data->>'nome_completo', 'Responsável') as nome
    from public.membros_familia mf
    join auth.users u on u.id = mf.user_id
    where mf.crianca_id = p_crianca_id
      and exists (
          select 1
          from public.membros_familia eu
          where eu.crianca_id = p_crianca_id
            and eu.user_id = auth.uid()
            and eu.ativo = true
      );
$$;


ALTER FUNCTION "public"."nomes_membros_familia"("p_crianca_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."sair_da_familia"() RETURNS boolean
    LANGUAGE "sql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
    delete from public.membros_familia
    where user_id = auth.uid()
    returning true;
$$;


ALTER FUNCTION "public"."sair_da_familia"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."sou_responsavel_principal_de"("p_crianca_id" "uuid") RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
    select exists (
        select 1
        from public.membros_familia
        where crianca_id = p_crianca_id
          and user_id = auth.uid()
          and papel = 'responsavel_principal'
          and ativo = true
    );
$$;


ALTER FUNCTION "public"."sou_responsavel_principal_de"("p_crianca_id" "uuid") OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."confirmacoes_evento" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "evento_id" "uuid",
    "user_id" "uuid",
    "nome" "text" NOT NULL,
    "status" "text" NOT NULL,
    CONSTRAINT "confirmacoes_evento_status_check" CHECK (("status" = ANY (ARRAY['confirmado'::"text", 'pendente'::"text", 'recusado'::"text"])))
);


ALTER TABLE "public"."confirmacoes_evento" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."convites" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "crianca_id" "uuid",
    "criado_por" "uuid",
    "vinculo" "text" NOT NULL,
    "papel" "text" NOT NULL,
    "token" "text" NOT NULL,
    "usado" boolean DEFAULT false,
    "expires_at" timestamp with time zone DEFAULT ("now"() + '7 days'::interval),
    "status" "text" DEFAULT 'pendente'::"text",
    CONSTRAINT "convites_papel_check" CHECK (("papel" = ANY (ARRAY['responsavel_principal'::"text", 'participante_familiar'::"text"])))
);


ALTER TABLE "public"."convites" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."criancas" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "nome" "text" NOT NULL,
    "data_nascimento" "date" NOT NULL,
    "foto_url" "text",
    "escola" "text",
    "periodo" "text",
    "professora" "text",
    "tipo_sanguineo" "text",
    "alergias" "text",
    "medicamentos" "text",
    "pediatra" "text",
    "pediatra_telefone" "text",
    "serie" "text",
    "emoji" "text" DEFAULT '🧒'::"text" NOT NULL
);


ALTER TABLE "public"."criancas" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."diario_reacoes" (
    "user_id" "uuid" NOT NULL,
    "post_id" "uuid" NOT NULL
);


ALTER TABLE "public"."diario_reacoes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."eventos" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "crianca_id" "uuid",
    "criado_por" "uuid",
    "titulo" "text" NOT NULL,
    "descricao" "text",
    "data_evento" "date" NOT NULL,
    "hora_evento" time without time zone,
    "quem_leva" "text",
    "quem_busca" "text",
    "dia_inteiro" boolean DEFAULT false
);


ALTER TABLE "public"."eventos" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."membros_familia" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "crianca_id" "uuid",
    "user_id" "uuid",
    "nome" "text" NOT NULL,
    "vinculo" "text" NOT NULL,
    "papel" "text" NOT NULL,
    "convidado_por" "uuid",
    "ativo" boolean DEFAULT true,
    CONSTRAINT "membros_familia_papel_check" CHECK (("papel" = ANY (ARRAY['responsavel_principal'::"text", 'participante_familiar'::"text"])))
);


ALTER TABLE "public"."membros_familia" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."posts_diario" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "crianca_id" "uuid",
    "autor_id" "uuid",
    "autor_nome" "text" NOT NULL,
    "autor_vinculo" "text" NOT NULL,
    "autor_papel" "text" NOT NULL,
    "texto" "text" NOT NULL,
    "tag" "text",
    "tem_foto" boolean DEFAULT false,
    "foto_url" "text",
    "reacoes" integer DEFAULT 0,
    "resposta_a" "uuid"
);


ALTER TABLE "public"."posts_diario" OWNER TO "postgres";


ALTER TABLE ONLY "public"."confirmacoes_evento"
    ADD CONSTRAINT "confirmacoes_evento_evento_id_user_id_key" UNIQUE ("evento_id", "user_id");



ALTER TABLE ONLY "public"."confirmacoes_evento"
    ADD CONSTRAINT "confirmacoes_evento_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."convites"
    ADD CONSTRAINT "convites_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."convites"
    ADD CONSTRAINT "convites_token_key" UNIQUE ("token");



ALTER TABLE ONLY "public"."criancas"
    ADD CONSTRAINT "criancas_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."diario_reacoes"
    ADD CONSTRAINT "diario_reacoes_pkey" PRIMARY KEY ("user_id", "post_id");



ALTER TABLE ONLY "public"."eventos"
    ADD CONSTRAINT "eventos_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."membros_familia"
    ADD CONSTRAINT "membros_familia_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."posts_diario"
    ADD CONSTRAINT "posts_diario_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_posts_diario_resposta_a" ON "public"."posts_diario" USING "btree" ("resposta_a");



ALTER TABLE ONLY "public"."confirmacoes_evento"
    ADD CONSTRAINT "confirmacoes_evento_evento_id_fkey" FOREIGN KEY ("evento_id") REFERENCES "public"."eventos"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."confirmacoes_evento"
    ADD CONSTRAINT "confirmacoes_evento_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."convites"
    ADD CONSTRAINT "convites_criado_por_fkey" FOREIGN KEY ("criado_por") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."convites"
    ADD CONSTRAINT "convites_crianca_id_fkey" FOREIGN KEY ("crianca_id") REFERENCES "public"."criancas"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."diario_reacoes"
    ADD CONSTRAINT "diario_reacoes_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "public"."posts_diario"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."diario_reacoes"
    ADD CONSTRAINT "diario_reacoes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."eventos"
    ADD CONSTRAINT "eventos_criado_por_fkey" FOREIGN KEY ("criado_por") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."eventos"
    ADD CONSTRAINT "eventos_crianca_id_fkey" FOREIGN KEY ("crianca_id") REFERENCES "public"."criancas"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."membros_familia"
    ADD CONSTRAINT "membros_familia_convidado_por_fkey" FOREIGN KEY ("convidado_por") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."membros_familia"
    ADD CONSTRAINT "membros_familia_crianca_id_fkey" FOREIGN KEY ("crianca_id") REFERENCES "public"."criancas"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."membros_familia"
    ADD CONSTRAINT "membros_familia_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."posts_diario"
    ADD CONSTRAINT "posts_diario_autor_id_fkey" FOREIGN KEY ("autor_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."posts_diario"
    ADD CONSTRAINT "posts_diario_crianca_id_fkey" FOREIGN KEY ("crianca_id") REFERENCES "public"."criancas"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."posts_diario"
    ADD CONSTRAINT "posts_diario_resposta_a_fkey" FOREIGN KEY ("resposta_a") REFERENCES "public"."posts_diario"("id") ON DELETE CASCADE;



CREATE POLICY "Reações visíveis a membros autenticados" ON "public"."diario_reacoes" FOR SELECT USING (("auth"."uid"() IS NOT NULL));



CREATE POLICY "Usuário insere próprias reações" ON "public"."diario_reacoes" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Usuário remove próprias reações" ON "public"."diario_reacoes" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "confirm_insert" ON "public"."confirmacoes_evento" FOR INSERT WITH CHECK (("user_id" = "auth"."uid"()));



CREATE POLICY "confirm_select" ON "public"."confirmacoes_evento" FOR SELECT USING (("evento_id" IN ( SELECT "eventos"."id"
   FROM "public"."eventos"
  WHERE ("eventos"."crianca_id" IN ( SELECT "public"."minhas_criancas"() AS "minhas_criancas")))));



CREATE POLICY "confirm_update" ON "public"."confirmacoes_evento" FOR UPDATE USING (("user_id" = "auth"."uid"()));



ALTER TABLE "public"."confirmacoes_evento" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "convites_insert" ON "public"."convites" FOR INSERT WITH CHECK (("crianca_id" IN ( SELECT "public"."minhas_criancas"() AS "minhas_criancas")));



CREATE POLICY "convites_select" ON "public"."convites" FOR SELECT USING (("crianca_id" IN ( SELECT "public"."minhas_criancas"() AS "minhas_criancas")));



CREATE POLICY "convites_update" ON "public"."convites" FOR UPDATE USING (("crianca_id" IN ( SELECT "public"."minhas_criancas"() AS "minhas_criancas")));



ALTER TABLE "public"."criancas" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "criancas_insert" ON "public"."criancas" FOR INSERT WITH CHECK (("auth"."uid"() IS NOT NULL));



CREATE POLICY "criancas_select" ON "public"."criancas" FOR SELECT USING (("id" IN ( SELECT "public"."minhas_criancas"() AS "minhas_criancas")));



CREATE POLICY "criancas_update" ON "public"."criancas" FOR UPDATE USING (("id" IN ( SELECT "public"."minhas_criancas"() AS "minhas_criancas")));



CREATE POLICY "diario_delete" ON "public"."posts_diario" FOR DELETE USING (("autor_id" = "auth"."uid"()));



CREATE POLICY "diario_insert" ON "public"."posts_diario" FOR INSERT WITH CHECK (("crianca_id" IN ( SELECT "public"."minhas_criancas"() AS "minhas_criancas")));



ALTER TABLE "public"."diario_reacoes" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "diario_select" ON "public"."posts_diario" FOR SELECT USING (("crianca_id" IN ( SELECT "public"."minhas_criancas"() AS "minhas_criancas")));



CREATE POLICY "diario_update" ON "public"."posts_diario" FOR UPDATE USING (("crianca_id" IN ( SELECT "public"."minhas_criancas"() AS "minhas_criancas")));



ALTER TABLE "public"."eventos" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "eventos_delete" ON "public"."eventos" FOR DELETE USING (("crianca_id" IN ( SELECT "public"."minhas_criancas"() AS "minhas_criancas")));



CREATE POLICY "eventos_insert" ON "public"."eventos" FOR INSERT WITH CHECK (("crianca_id" IN ( SELECT "public"."minhas_criancas"() AS "minhas_criancas")));



CREATE POLICY "eventos_select" ON "public"."eventos" FOR SELECT USING (("crianca_id" IN ( SELECT "public"."minhas_criancas"() AS "minhas_criancas")));



CREATE POLICY "eventos_update" ON "public"."eventos" FOR UPDATE USING (("crianca_id" IN ( SELECT "public"."minhas_criancas"() AS "minhas_criancas")));



ALTER TABLE "public"."membros_familia" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "membros_insert" ON "public"."membros_familia" FOR INSERT WITH CHECK (("user_id" = "auth"."uid"()));



CREATE POLICY "membros_select" ON "public"."membros_familia" FOR SELECT USING (("crianca_id" IN ( SELECT "public"."minhas_criancas"() AS "minhas_criancas")));



CREATE POLICY "membros_update" ON "public"."membros_familia" FOR UPDATE USING (("user_id" = "auth"."uid"()));



ALTER TABLE "public"."posts_diario" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "responsavel_principal_exclui_participante" ON "public"."membros_familia" FOR DELETE TO "authenticated" USING ((("papel" = 'participante_familiar'::"text") AND "public"."sou_responsavel_principal_de"("crianca_id")));



GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";



GRANT ALL ON FUNCTION "public"."convite_por_token"("p_token" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."convite_por_token"("p_token" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."convite_por_token"("p_token" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."criar_crianca_com_responsavel"("p_nome" "text", "p_data_nascimento" "date", "p_emoji" "text", "p_tipo_sanguineo" "text", "p_alergias" "text", "p_medicamentos" "text", "p_pediatra" "text", "p_pediatra_telefone" "text", "p_escola" "text", "p_serie" "text", "p_periodo" "text", "p_professora" "text", "p_nome_responsavel" "text", "p_vinculo" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."criar_crianca_com_responsavel"("p_nome" "text", "p_data_nascimento" "date", "p_emoji" "text", "p_tipo_sanguineo" "text", "p_alergias" "text", "p_medicamentos" "text", "p_pediatra" "text", "p_pediatra_telefone" "text", "p_escola" "text", "p_serie" "text", "p_periodo" "text", "p_professora" "text", "p_nome_responsavel" "text", "p_vinculo" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."criar_crianca_com_responsavel"("p_nome" "text", "p_data_nascimento" "date", "p_emoji" "text", "p_tipo_sanguineo" "text", "p_alergias" "text", "p_medicamentos" "text", "p_pediatra" "text", "p_pediatra_telefone" "text", "p_escola" "text", "p_serie" "text", "p_periodo" "text", "p_professora" "text", "p_nome_responsavel" "text", "p_vinculo" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."minhas_criancas"() TO "anon";
GRANT ALL ON FUNCTION "public"."minhas_criancas"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."minhas_criancas"() TO "service_role";



GRANT ALL ON FUNCTION "public"."nomes_membros_familia"("p_crianca_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."nomes_membros_familia"("p_crianca_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."nomes_membros_familia"("p_crianca_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."sair_da_familia"() TO "anon";
GRANT ALL ON FUNCTION "public"."sair_da_familia"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."sair_da_familia"() TO "service_role";



GRANT ALL ON FUNCTION "public"."sou_responsavel_principal_de"("p_crianca_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."sou_responsavel_principal_de"("p_crianca_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."sou_responsavel_principal_de"("p_crianca_id" "uuid") TO "service_role";



GRANT ALL ON TABLE "public"."confirmacoes_evento" TO "anon";
GRANT ALL ON TABLE "public"."confirmacoes_evento" TO "authenticated";
GRANT ALL ON TABLE "public"."confirmacoes_evento" TO "service_role";



GRANT ALL ON TABLE "public"."convites" TO "anon";
GRANT ALL ON TABLE "public"."convites" TO "authenticated";
GRANT ALL ON TABLE "public"."convites" TO "service_role";



GRANT ALL ON TABLE "public"."criancas" TO "anon";
GRANT ALL ON TABLE "public"."criancas" TO "authenticated";
GRANT ALL ON TABLE "public"."criancas" TO "service_role";



GRANT ALL ON TABLE "public"."diario_reacoes" TO "anon";
GRANT ALL ON TABLE "public"."diario_reacoes" TO "authenticated";
GRANT ALL ON TABLE "public"."diario_reacoes" TO "service_role";



GRANT ALL ON TABLE "public"."eventos" TO "anon";
GRANT ALL ON TABLE "public"."eventos" TO "authenticated";
GRANT ALL ON TABLE "public"."eventos" TO "service_role";



GRANT ALL ON TABLE "public"."membros_familia" TO "anon";
GRANT ALL ON TABLE "public"."membros_familia" TO "authenticated";
GRANT ALL ON TABLE "public"."membros_familia" TO "service_role";



GRANT ALL ON TABLE "public"."posts_diario" TO "anon";
GRANT ALL ON TABLE "public"."posts_diario" TO "authenticated";
GRANT ALL ON TABLE "public"."posts_diario" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";







