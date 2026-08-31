-- Adiciona domínio próprio às lojas sem interromper registros legados.
ALTER TABLE public.lojas
  ADD COLUMN IF NOT EXISTS dominio text;

-- Normaliza valores existentes: protocolo, caminho, porta, ponto final e www.
UPDATE public.lojas
SET dominio = NULLIF(
  regexp_replace(
    regexp_replace(
      regexp_replace(
        regexp_replace(lower(trim(dominio)), '^[a-z][a-z0-9+.-]*://', ''),
        '[/?#].*$',
        ''
      ),
      ':[0-9]+$',
      ''
    ),
    '\.+$',
    ''
  ),
  ''
);

UPDATE public.lojas
SET dominio = regexp_replace(dominio, '^www\.', '')
WHERE dominio IS NOT NULL;

-- O domínio permanece opcional durante a transição, mas deve estar normalizado.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'lojas_dominio_normalizado_check'
      AND conrelid = 'public.lojas'::regclass
  ) THEN
    ALTER TABLE public.lojas
      ADD CONSTRAINT lojas_dominio_normalizado_check
      CHECK (
        dominio IS NULL
        OR (
          dominio = lower(trim(dominio))
          AND dominio !~ '^www\.'
          AND char_length(dominio) <= 253
          AND dominio ~ '^([a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$'
        )
      );
  END IF;
END
$$;

-- Garante que um domínio não possa apontar para mais de uma loja.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'lojas_dominio_unique'
      AND conrelid = 'public.lojas'::regclass
  ) THEN
    ALTER TABLE public.lojas
      ADD CONSTRAINT lojas_dominio_unique UNIQUE (dominio);
  END IF;
END
$$;
