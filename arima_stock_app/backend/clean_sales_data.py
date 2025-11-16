import pandas as pd

# === 1. BACA FILE EXCEL ===
file_path = "data/Sales Recapitulation Detail Report 1 - Copy.xlsx"  # ganti jika namanya berbeda
df = pd.read_excel(file_path)

print("📊 Kolom ditemukan:", list(df.columns))

# === 2. HAPUS BARIS DENGAN 'DJ MODIFIER' ===
if 'Menu Category Detail' in df.columns:
    before = len(df)
    df = df[~df['Menu Category Detail'].str.upper().isin(['DJ MODIFIER', 'MISCELLANEOUS'])]
    after = len(df)
    print(f"✅ Menghapus {before - after} baris dengan kategori 'DJ MODIFIER'")
else:
    print("⚠️ Kolom 'Menu Category Detail' tidak ditemukan!")

# === 3. PILIH KOLOM YANG DIBUTUHKAN ===
rename_map = {
    "Sales Date": "sales_date",
    "Menu": "menu",
    "Qty": "qty"
}
df = df.rename(columns=rename_map)

df = df[["sales_date", "menu", "qty"]]

# === 4. FORMAT DAN BERSIHKAN DATA ===
df['sales_date'] = pd.to_datetime(df['sales_date'], errors='coerce')
df = df.dropna(subset=['sales_date', 'menu', 'qty'])

# Hapus duplikat jika ada
df = df.drop_duplicates()

# === 5. SIMPAN FILE CSV BARU ===
output_file = "sales_upload_clean.csv"
df.to_csv(output_file, index=False)

print(f"\n✅ File sudah dibersihkan dan disimpan sebagai: {output_file}")
print(f"📈 Total baris tersisa: {len(df)}")
print("\nContoh data bersih:")
print(df.head())
