-- Menambahkan kolom tanggal kegiatan Desember pada tabel school_registrations.
-- Tipe data disamakan otomatis dengan kolom selected_dates_nov.
DO $$
DECLARE
  col_type text;
BEGIN
  SELECT format_type(atttypid, atttypmod) INTO col_type
  FROM pg_attribute
  WHERE attrelid = 'public.school_registrations'::regclass
    AND attname = 'selected_dates_nov'
    AND NOT attisdropped;

  IF col_type IS NULL THEN
    col_type := 'integer[]';
  END IF;

  EXECUTE format(
    'ALTER TABLE public.school_registrations ADD COLUMN IF NOT EXISTS selected_dates_dec %s',
    col_type
  );
END $$;

-- Muat ulang schema cache PostgREST agar kolom baru langsung dikenali
NOTIFY pgrst, 'reload schema';
