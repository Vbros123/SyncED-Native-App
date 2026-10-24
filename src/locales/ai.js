const entries = {
  'AI hint': ['Pista de IA', 'AI संकेत', 'تلميح الذكاء الاصطناعي', 'Indice IA'],
  'Optional on-device AI. The first download is large and needs internet. Cached models can work offline; your responses stay on this device.': ['IA opcional en el dispositivo. La primera descarga es grande y necesita internet. Los modelos guardados pueden funcionar sin conexión; tus respuestas quedan aquí.', 'वैकल्पिक AI इसी डिवाइस पर चलता है। पहला बड़ा डाउनलोड इंटरनेट माँगता है। सहेजे मॉडल ऑफ़लाइन चल सकते हैं; आपके उत्तर यहीं रहते हैं।', 'ذكاء اصطناعي اختياري على الجهاز. التنزيل الأول كبير ويتطلب الإنترنت. قد تعمل النماذج المحفوظة دون اتصال؛ تبقى إجاباتك على الجهاز.', 'IA facultative sur cet appareil. Le premier téléchargement est volumineux et nécessite internet. Les modèles en cache peuvent fonctionner hors ligne ; vos réponses restent ici.'],
  'AI is unavailable on this device. You can still use the learning tip below.': ['La IA no está disponible aquí. Usa el consejo de abajo.', 'इस डिवाइस पर AI उपलब्ध नहीं है। नीचे दी गई सीखने की सलाह लें।', 'الذكاء الاصطناعي غير متاح على هذا الجهاز. يمكنك استخدام نصيحة التعلم أدناه.', 'L’IA est indisponible sur cet appareil. Utilisez le conseil ci-dessous.'],
  'Loading AI model: {percent}%': ['Cargando modelo: {percent}%', 'AI मॉडल लोड हो रहा है: {percent}%', 'تحميل النموذج: {percent}%', 'Chargement du modèle : {percent}%'],
  'Thinking of a hint…': ['Preparando una pista…', 'संकेत तैयार हो रहा है…', 'جارٍ إعداد تلميح…', 'Préparation d’un indice…'],
  'AI could not provide a hint. Try the learning tip below.': ['La IA no pudo dar una pista. Usa el consejo de abajo.', 'AI संकेत नहीं दे सका। नीचे दी गई सीखने की सलाह लें।', 'تعذر تقديم تلميح. جرّب نصيحة التعلم أدناه.', 'L’IA n’a pas pu fournir d’indice. Essayez le conseil ci-dessous.'],
  'Download / use AI hint': ['Descargar / usar pista de IA', 'डाउनलोड करें / AI संकेत लें', 'تنزيل / استخدام تلميح', 'Télécharger / utiliser l’indice IA'],
  'Learning tip': ['Consejo de aprendizaje', 'सीखने की सलाह', 'نصيحة للتعلم', 'Conseil d’apprentissage'],
  'AI hints can be wrong. Check them against the lesson.': ['Las pistas de IA pueden equivocarse. Compáralas con la lección.', 'AI संकेत गलत हो सकते हैं। उन्हें पाठ से जाँचें।', 'قد تكون التلميحات خاطئة. تحقق منها بمقارنتها بالدرس.', 'Les indices IA peuvent être faux. Vérifiez-les avec la leçon.'],
}

export const aiMessages = Object.fromEntries(['es', 'hi', 'ar', 'fr'].map((language, index) => [
  language, Object.fromEntries(Object.entries(entries).map(([key, values]) => [key, values[index]])),
]))
