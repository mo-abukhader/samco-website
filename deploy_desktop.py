import os
import shutil

src = r'C:\Users\user\.gemini\antigravity-ide\scratch\samco-portfolio'
dest1 = r'C:\Users\user\Desktop\samco-portfolio'
dest2 = r'C:\Users\user\Desktop\سامكو جديد'

for dest in [dest1, dest2]:
    if os.path.exists(dest):
        shutil.rmtree(dest)
    shutil.copytree(src, dest)
    print("Synced successfully to desktop destination.")

# Create launcher on Desktop
launcher_path = r'C:\Users\user\Desktop\عرض موقع سامكو في جوجل.html'
html_content = """<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="refresh" content="0;url=samco-portfolio/index.html">
  <title>معاينة موقع شركة سامكو</title>
  <style>
    body { font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; background: #091e3a; color: white; margin: 0; }
    .box { text-align: center; background: rgba(255,255,255,0.1); padding: 30px; border-radius: 16px; }
    a { color: #38bdf8; font-weight: bold; }
  </style>
</head>
<body>
  <div class="box">
    <h2>جارٍ توجيهك إلى موقع سامكو الجديد...</h2>
    <p>إذا لم يتم نقلك تلقائياً، <a href="samco-portfolio/index.html">اضغط هنا لفتح الموقع</a></p>
  </div>
</body>
</html>
"""

with open(launcher_path, 'w', encoding='utf-8') as f:
    f.write(html_content)

# Also create batch launcher on Desktop
batch_path = r'C:\Users\user\Desktop\تشغيل موقع سامكو.bat'
with open(batch_path, 'w', encoding='utf-8') as f:
    f.write('@echo off\nstart "" "samco-portfolio\\index.html"\nexit\n')

print('Desktop shortcuts created successfully!')
