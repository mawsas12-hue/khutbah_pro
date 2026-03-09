import { useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Clipboard,
  Alert,
  StatusBar,
  SafeAreaView,
} from "react-native";

// ═══════════════════════════════════════
//              الألوان
// ═══════════════════════════════════════
const C = {
  bg: "#0d0d0f",
  surface: "#141417",
  surface2: "#1c1c21",
  border: "#2a2a32",
  gold: "#c9a84c",
  goldLight: "#e8c96d",
  goldDim: "#7a6230",
  text: "#f0ead8",
  textMuted: "#8a8070",
  textDim: "#4a4540",
  accent: "#8b5e2a",
  green: "#4a8c5c",
  greenLight: "#6aac7c",
};

// ═══════════════════════════════════════
//              الإعدادات الافتراضية
// ═══════════════════════════════════════
const DEFAULTS = {
  topic: "",
  duration: 30,
  fasaha: "2",
  narration: "classic",
  orientation: "balanced",
  evidenceDensity: "medium",
  audience_age: "23-30",
  audience_religiosity: "moderate",
  audience_context: "general",
  preacher_style: "neutral",
  geography: "arab_general",
  stories: [],
  contemporary_issues: [],
  avoid: [],
  attachments: [],
  madhab: "wasati",
  series: false,
  series_title: "",
  series_episode: "",
  notes: "",
};

// ═══════════════════════════════════════
//         مكوّن: زر الخيار
// ═══════════════════════════════════════
function OptionBtn({ label, selected, onPress }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.optionBtn, selected && styles.optionBtnSelected]}
    >
      <Text style={[styles.optionBtnText, selected && styles.optionBtnTextSelected]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

// ═══════════════════════════════════════
//         مكوّن: مجموعة خيارات
// ═══════════════════════════════════════
function OptionGroup({ options, value, onChange, cols = 2 }) {
  return (
    <View style={styles.optionsGrid}>
      {options.map((opt, i) => (
        <View key={opt.value} style={{ width: `${100 / cols}%`, padding: 3 }}>
          <OptionBtn
            label={opt.label}
            selected={value === opt.value}
            onPress={() => onChange(opt.value)}
          />
        </View>
      ))}
    </View>
  );
}

// ═══════════════════════════════════════
//         مكوّن: مجموعة مربعات اختيار
// ═══════════════════════════════════════
function CheckboxGroup({ options, values, onChange }) {
  const toggle = (val) => {
    onChange(values.includes(val) ? values.filter((v) => v !== val) : [...values, val]);
  };
  return (
    <View>
      {options.map((opt) => {
        const checked = values.includes(opt.value);
        return (
          <TouchableOpacity
            key={opt.value}
            onPress={() => toggle(opt.value)}
            style={[styles.checkboxItem, checked && styles.checkboxItemChecked]}
          >
            <View style={[styles.checkboxBox, checked && styles.checkboxBoxChecked]}>
              {checked && <Text style={styles.checkboxTick}>✓</Text>}
            </View>
            <Text style={[styles.checkboxLabel, checked && styles.checkboxLabelChecked]}>
              {opt.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// ═══════════════════════════════════════
//         مكوّن: قسم قابل للطي
// ═══════════════════════════════════════
function Section({ icon, title, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <View style={styles.card}>
      <TouchableOpacity onPress={() => setOpen(!open)} style={styles.cardHeader}>
        <View style={styles.cardIcon}>
          <Text style={{ fontSize: 16 }}>{icon}</Text>
        </View>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardChevron}>{open ? "▲" : "▼"}</Text>
      </TouchableOpacity>
      {open && <View style={styles.cardBody}>{children}</View>}
    </View>
  );
}

// ═══════════════════════════════════════
//         دالة توليد البروبمت
// ═══════════════════════════════════════
function generatePrompt(s) {
  const fasahaMap = {
    "1": "فصاحة كلاسيكية عالية (لغة السلف، مفردات قديمة، تراكيب معقدة)",
    "2": "فصاحة معاصرة راقية (توازن بين الفصاحة والوضوح)",
    "3": "فصاحة مبسطة (لغة فصيحة بمفردات سهلة للفهم السريع)",
  };
  const narrationMap = {
    classic: "النمط الكلاسيكي (خطي متسلسل)",
    circular: "النمط الدائري (البداية بقصة والعودة لها في النهاية)",
    crescendo: "النمط التصاعدي (بناء الحماس تدريجياً حتى الذروة)",
    wave: "النمط المتموج (تبادل بين الترغيب والترهيب)",
  };
  const orientationMap = {
    targhib: "ترغيبي (70% ترغيب، 30% ترهيب)",
    balanced: "متوازن (50% ترغيب، 50% ترهيب)",
    tarhib: "ترهيبي (30% ترغيب، 70% ترهيب)",
    motivational: "تحفيزي (تركيز على العمل والإنجاز)",
    therapeutic: "علاجي (تركيز على حل مشكلة نفسية/اجتماعية)",
  };
  const evidenceMap = {
    light: "خفيفة (آية واحدة + حديث واحد)",
    medium: "متوسطة (2-3 آيات + 2-3 أحاديث)",
    heavy: "كثيفة (5+ آيات + 5+ أحاديث + أقوال سلف)",
  };
  const ageMap = {
    "15-22": "شباب مبكر (15-22 سنة)",
    "23-30": "شباب متوسط (23-30 سنة)",
    "31-40": "شباب متأخر (31-40 سنة)",
    general: "جمهور عام",
  };
  const religiosityMap = {
    committed: "ملتزمون يبحثون عن المزيد",
    moderate: "في طريق الالتزام",
    lagging: "مقصرون يريدون العودة",
    far: "بعيدون عن الدين",
  };
  const contextMap = {
    general: "جمهور عام",
    university: "طلاب جامعة",
    employees: "موظفون",
    entrepreneurs: "رواد أعمال",
    married: "متزوجون وآباء",
    singles: "عزاب",
  };
  const styleMap = {
    wise: "حكيم متأمل",
    practical: "محفز عملي",
    emotional: "عاطفي مؤثر",
    scholarly: "علمي موثق",
    fatherly: "أبوي حنون",
    neutral: "محايد متوازن",
  };
  const geoMap = {
    arab_general: "عربي عام",
    gulf: "خليجي",
    egyptian: "مصري/شامي",
    maghrebi: "مغاربي",
    western: "مسلمو الغرب",
  };
  const madhabMap = {
    wasati: "وسطي عام (بدون تحيز لمذهب)",
    hanafi: "حنفي",
    maliki: "مالكي",
    shafii: "شافعي",
    hanbali: "حنبلي",
    salafi: "سلفي (التركيز على الدليل من الكتاب والسنة)",
  };

  const storyLabels = {
    prophets: "قصص الأنبياء عليهم السلام",
    companions: "قصص الصحابة الكرام",
    salaf: "قصص السلف والتابعين",
    contemporary: "قصص معاصرة واقعية",
    daily_life: "أمثلة من الحياة اليومية",
    parables: "تشبيهات وأمثال",
  };
  const issueLabels = {
    social_media: "إدمان وسائل التواصل الاجتماعي",
    spiritual_emptiness: "الفراغ الروحي والقلق النفسي",
    weak_determination: "ضعف الهمة والإنجاز",
    shallow_relations: "العلاقات الاجتماعية السطحية",
    desires: "الشهوات والفتن",
    unemployment: "البطالة والضغوط المالية",
    family_ties: "العقوق وقطيعة الرحم",
    worship_fatigue: "الفتور في العبادة",
  };
  const avoidLabels = {
    politics: "القضايا السياسية المثيرة للجدل",
    fiqh_details: "الخلافات الفقهية التفصيلية",
    groups: "ذكر مذاهب أو جماعات معينة",
    weak_hadith: "القصص الضعيفة أو الموضوعة",
    excessive_emotion: "المبالغة العاطفية المفرطة",
    sectarian: "الفتن الطائفية",
  };
  const attachLabels = {
    references: "قائمة المراجع والمصادر",
    bullet_summary: "ملف نقاط رئيسية للمشاهد",
    social_quotes: "اقتباسات للسوشال ميديا (10-15 اقتباس)",
    interactive_questions: "أسئلة تفاعلية للتعليقات",
    youtube_desc: "وصف الفيديو المقترح لليوتيوب",
    hashtags: "هاشتاجات مقترحة",
  };

  const wordsEst = Math.round((s.duration / 10) * 1700);
  const stories = s.stories.map((v) => storyLabels[v]);
  const issues = s.contemporary_issues.map((v) => issueLabels[v]);
  const avoid = s.avoid.map((v) => avoidLabels[v]);
  const attachments = s.attachments.map((v) => attachLabels[v]);

  return `بسم الله الرحمن الرحيم

══════════════════════════════
   طلب إنشاء خطبة / محتوى دعوي
══════════════════════════════

【 الموضوع 】
${s.topic || "(لم يُحدد بعد)"}

【 المدة والطول 】
• المدة المطلوبة: ${s.duration} دقيقة
• الكلمات التقريبية: ~${wordsEst.toLocaleString("ar-EG")} كلمة

【 الأسلوب اللغوي 】
• مستوى الفصاحة: ${fasahaMap[s.fasaha]}
• أسلوب السرد: ${narrationMap[s.narration]}

【 المحتوى والتوجه 】
• التوجه العام: ${orientationMap[s.orientation]}
• كثافة الأدلة الشرعية: ${evidenceMap[s.evidenceDensity]}
${stories.length ? `• مصادر القصص:\n${stories.map((x) => "  – " + x).join("\n")}` : ""}
${issues.length ? `• التحديات المعاصرة:\n${issues.map((x) => "  – " + x).join("\n")}` : ""}

【 الجمهور المستهدف 】
• الفئة العمرية: ${ageMap[s.audience_age]}
• الحالة الدينية: ${religiosityMap[s.audience_religiosity]}
• السياق الاجتماعي: ${contextMap[s.audience_context]}

【 شخصية الخطيب 】
• الأسلوب: ${styleMap[s.preacher_style]}
• السياق الجغرافي: ${geoMap[s.geography]}

【 المنهج الفقهي 】
• المنهج: ${madhabMap[s.madhab]}

${avoid.length ? `【 أمور يجب تجنبها 】\n${avoid.map((x) => "• " + x).join("\n")}\n` : ""}
${s.series ? `【 السلسلة 】\n• عنوان السلسلة: ${s.series_title || "(غير محدد)"}\n• رقم الحلقة: ${s.series_episode || "غير محدد"}\n` : ""}
${attachments.length ? `【 ملحقات مطلوبة 】\n${attachments.map((x) => "• " + x).join("\n")}\n` : ""}
${s.notes ? `【 ملاحظات خاصة 】\n${s.notes}\n` : ""}
══════════════════════════════
يُرجى الالتزام بكل التفاصيل المذكورة
وصلى الله على نبينا محمد وآله وصحبه أجمعين.
══════════════════════════════`;
}

// ═══════════════════════════════════════
//              التطبيق الرئيسي
// ═══════════════════════════════════════
export default function App() {
  const [state, setState] = useState({ ...DEFAULTS });
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState("form"); // "form" | "output"

  const update = (key) => (val) => setState((s) => ({ ...s, [key]: val }));
  const prompt = generatePrompt(state);

  const copyPrompt = useCallback(() => {
    Clipboard.setString(prompt);
    setCopied(true);
    Alert.alert("✅ تم النسخ!", "الـ Prompt جاهز للصق في أي تطبيق ذكاء اصطناعي");
    setTimeout(() => setCopied(false), 3000);
  }, [prompt]);

  const reset = () => {
    setState({ ...DEFAULTS });
    Alert.alert("🔄 تم الإعادة", "تم إعادة ضبط جميع الإعدادات");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />

      {/* الهيدر */}
      <View style={styles.header}>
        <Text style={styles.bismillah}>بسم الله الرحمن الرحيم</Text>
        <Text style={styles.appTitle}>مُولِّد بروبمت الخطب</Text>
        <Text style={styles.appSubtitle}>خصِّص خطبتك واحصل على Prompt احترافي</Text>
      </View>

      {/* تبويبات */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "form" && styles.tabActive]}
          onPress={() => setActiveTab("form")}
        >
          <Text style={[styles.tabText, activeTab === "form" && styles.tabTextActive]}>
            📝 الإعدادات
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "output" && styles.tabActive]}
          onPress={() => setActiveTab("output")}
        >
          <Text style={[styles.tabText, activeTab === "output" && styles.tabTextActive]}>
            ✨ الـ Prompt
          </Text>
        </TouchableOpacity>
      </View>

      {/* المحتوى */}
      {activeTab === "form" ? (
        <ScrollView style={styles.scroll} contentContainerStyle={{ padding: 12, paddingBottom: 40 }}>

          {/* الأساسيات */}
          <Section icon="📝" title="الأساسيات" defaultOpen={true}>
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>موضوع الخطبة *</Text>
              <TextInput
                style={styles.fieldInput}
                placeholder="مثال: الأمل في رحمة الله، التوبة..."
                placeholderTextColor={C.textDim}
                value={state.topic}
                onChangeText={update("topic")}
                textAlign="right"
              />
            </View>
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>
                مدة الخطبة:{" "}
                <Text style={{ color: C.gold, fontWeight: "bold" }}>{state.duration} دقيقة</Text>
              </Text>
              <View style={styles.durationRow}>
                {[10, 20, 30, 45, 60, 90].map((d) => (
                  <TouchableOpacity
                    key={d}
                    onPress={() => update("duration")(d)}
                    style={[styles.durationBtn, state.duration === d && styles.durationBtnSelected]}
                  >
                    <Text style={[styles.durationBtnText, state.duration === d && styles.durationBtnTextSelected]}>
                      {d}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </Section>

          {/* الأسلوب */}
          <Section icon="✍️" title="الأسلوب اللغوي">
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>مستوى الفصاحة</Text>
              <OptionGroup
                value={state.fasaha}
                onChange={update("fasaha")}
                options={[
                  { value: "1", label: "🏛️ كلاسيكية عالية" },
                  { value: "2", label: "⚖️ معاصرة راقية" },
                  { value: "3", label: "💬 مبسطة واضحة" },
                ]}
                cols={3}
              />
            </View>
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>أسلوب السرد</Text>
              <OptionGroup
                value={state.narration}
                onChange={update("narration")}
                options={[
                  { value: "classic", label: "📖 كلاسيكي" },
                  { value: "circular", label: "🔄 دائري" },
                  { value: "crescendo", label: "📈 تصاعدي" },
                  { value: "wave", label: "〰️ متموج" },
                ]}
                cols={2}
              />
            </View>
          </Section>

          {/* المحتوى */}
          <Section icon="⚖️" title="المحتوى والتوجه">
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>التوجه العام</Text>
              <OptionGroup
                value={state.orientation}
                onChange={update("orientation")}
                options={[
                  { value: "targhib", label: "🌟 ترغيبي" },
                  { value: "balanced", label: "⚖️ متوازن" },
                  { value: "tarhib", label: "⚠️ ترهيبي" },
                  { value: "motivational", label: "💪 تحفيزي" },
                  { value: "therapeutic", label: "💊 علاجي" },
                ]}
                cols={3}
              />
            </View>
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>كثافة الأدلة الشرعية</Text>
              <OptionGroup
                value={state.evidenceDensity}
                onChange={update("evidenceDensity")}
                options={[
                  { value: "light", label: "🌿 خفيفة" },
                  { value: "medium", label: "📚 متوسطة" },
                  { value: "heavy", label: "🔬 كثيفة" },
                ]}
                cols={3}
              />
            </View>
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>مصادر القصص المفضلة</Text>
              <CheckboxGroup
                values={state.stories}
                onChange={update("stories")}
                options={[
                  { value: "prophets", label: "قصص الأنبياء عليهم السلام" },
                  { value: "companions", label: "قصص الصحابة الكرام" },
                  { value: "salaf", label: "قصص السلف والتابعين" },
                  { value: "contemporary", label: "قصص معاصرة واقعية" },
                  { value: "daily_life", label: "أمثلة من الحياة اليومية" },
                  { value: "parables", label: "تشبيهات وأمثال" },
                ]}
              />
            </View>
          </Section>

          {/* الجمهور */}
          <Section icon="👥" title="الجمهور المستهدف">
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>الفئة العمرية</Text>
              <OptionGroup
                value={state.audience_age}
                onChange={update("audience_age")}
                options={[
                  { value: "15-22", label: "🌱 15-22" },
                  { value: "23-30", label: "🔥 23-30" },
                  { value: "31-40", label: "🏗️ 31-40" },
                  { value: "general", label: "🌍 عام" },
                ]}
                cols={4}
              />
            </View>
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>الحالة الدينية</Text>
              <OptionGroup
                value={state.audience_religiosity}
                onChange={update("audience_religiosity")}
                options={[
                  { value: "committed", label: "✅ ملتزمون" },
                  { value: "moderate", label: "🛤️ في الطريق" },
                  { value: "lagging", label: "🔙 مقصرون" },
                  { value: "far", label: "🌊 بعيدون" },
                ]}
                cols={2}
              />
            </View>
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>السياق الاجتماعي</Text>
              <OptionGroup
                value={state.audience_context}
                onChange={update("audience_context")}
                options={[
                  { value: "general", label: "🌍 عام" },
                  { value: "university", label: "🎓 طلاب" },
                  { value: "employees", label: "💼 موظفون" },
                  { value: "entrepreneurs", label: "🚀 رواد أعمال" },
                  { value: "married", label: "👨‍👩‍👧 متزوجون" },
                  { value: "singles", label: "🧍 عزاب" },
                ]}
                cols={3}
              />
            </View>
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>التحديات المعاصرة</Text>
              <CheckboxGroup
                values={state.contemporary_issues}
                onChange={update("contemporary_issues")}
                options={[
                  { value: "social_media", label: "📱 إدمان التواصل الاجتماعي" },
                  { value: "spiritual_emptiness", label: "💭 الفراغ الروحي والقلق" },
                  { value: "weak_determination", label: "😴 ضعف الهمة والإنجاز" },
                  { value: "shallow_relations", label: "🫂 العلاقات السطحية" },
                  { value: "desires", label: "🌊 الشهوات والفتن" },
                  { value: "unemployment", label: "💰 البطالة والضغوط المالية" },
                  { value: "family_ties", label: "👨‍👩‍👦 العقوق وقطيعة الرحم" },
                  { value: "worship_fatigue", label: "😮‍💨 الفتور في العبادة" },
                ]}
              />
            </View>
          </Section>

          {/* الخطيب */}
          <Section icon="🎤" title="شخصية الخطيب والبيئة">
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>أسلوب الخطيب</Text>
              <OptionGroup
                value={state.preacher_style}
                onChange={update("preacher_style")}
                options={[
                  { value: "wise", label: "🧘 حكيم" },
                  { value: "practical", label: "⚡ عملي" },
                  { value: "emotional", label: "❤️ عاطفي" },
                  { value: "scholarly", label: "📖 علمي" },
                  { value: "fatherly", label: "🤲 أبوي" },
                  { value: "neutral", label: "⚖️ محايد" },
                ]}
                cols={3}
              />
            </View>
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>السياق الجغرافي</Text>
              <OptionGroup
                value={state.geography}
                onChange={update("geography")}
                options={[
                  { value: "arab_general", label: "🌍 عربي عام" },
                  { value: "gulf", label: "🏜️ خليجي" },
                  { value: "egyptian", label: "🏛️ مصري/شامي" },
                  { value: "maghrebi", label: "🌊 مغاربي" },
                  { value: "western", label: "🗽 مسلمو الغرب" },
                ]}
                cols={3}
              />
            </View>
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>المنهج الفقهي</Text>
              <OptionGroup
                value={state.madhab}
                onChange={update("madhab")}
                options={[
                  { value: "wasati", label: "⚖️ وسطي" },
                  { value: "hanafi", label: "حنفي" },
                  { value: "maliki", label: "مالكي" },
                  { value: "shafii", label: "شافعي" },
                  { value: "hanbali", label: "حنبلي" },
                  { value: "salafi", label: "📖 سلفي" },
                ]}
                cols={3}
              />
            </View>
          </Section>

          {/* المحاذير */}
          <Section icon="🚫" title="المحاذير والضوابط">
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>أمور يجب تجنبها</Text>
              <CheckboxGroup
                values={state.avoid}
                onChange={update("avoid")}
                options={[
                  { value: "politics", label: "القضايا السياسية المثيرة للجدل" },
                  { value: "fiqh_details", label: "الخلافات الفقهية التفصيلية" },
                  { value: "groups", label: "ذكر مذاهب أو جماعات معينة" },
                  { value: "weak_hadith", label: "القصص الضعيفة أو الموضوعة" },
                  { value: "excessive_emotion", label: "المبالغة العاطفية المفرطة" },
                  { value: "sectarian", label: "الفتن الطائفية" },
                ]}
              />
            </View>
          </Section>

          {/* الملحقات */}
          <Section icon="📎" title="الملحقات والإضافات">
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>ملحقات إضافية مطلوبة</Text>
              <CheckboxGroup
                values={state.attachments}
                onChange={update("attachments")}
                options={[
                  { value: "references", label: "📚 قائمة بالمراجع والمصادر" },
                  { value: "bullet_summary", label: "📌 نقاط رئيسية للمشاهد" },
                  { value: "social_quotes", label: "📲 اقتباسات للسوشال ميديا" },
                  { value: "interactive_questions", label: "❓ أسئلة تفاعلية للتعليقات" },
                  { value: "youtube_desc", label: "▶️ وصف الفيديو لليوتيوب" },
                  { value: "hashtags", label: "#️⃣ هاشتاجات مقترحة" },
                ]}
              />
            </View>

            <TouchableOpacity
              onPress={() => update("series")(!state.series)}
              style={[styles.checkboxItem, state.series && styles.checkboxItemChecked]}
            >
              <View style={[styles.checkboxBox, state.series && styles.checkboxBoxChecked]}>
                {state.series && <Text style={styles.checkboxTick}>✓</Text>}
              </View>
              <Text style={[styles.checkboxLabel, state.series && styles.checkboxLabelChecked]}>
                هذه الخطبة جزء من سلسلة
              </Text>
            </TouchableOpacity>

            {state.series && (
              <>
                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>عنوان السلسلة</Text>
                  <TextInput
                    style={styles.fieldInput}
                    placeholder="مثال: سلسلة أسماء الله الحسنى..."
                    placeholderTextColor={C.textDim}
                    value={state.series_title}
                    onChangeText={update("series_title")}
                    textAlign="right"
                  />
                </View>
                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>رقم الحلقة</Text>
                  <TextInput
                    style={styles.fieldInput}
                    placeholder="مثال: 3"
                    placeholderTextColor={C.textDim}
                    value={state.series_episode}
                    onChangeText={update("series_episode")}
                    keyboardType="numeric"
                    textAlign="right"
                  />
                </View>
              </>
            )}
          </Section>

          {/* ملاحظات */}
          <Section icon="💡" title="ملاحظات خاصة">
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>أي تفاصيل إضافية</Text>
              <TextInput
                style={[styles.fieldInput, { minHeight: 100, textAlignVertical: "top" }]}
                placeholder="مثال: أريد التركيز على حادثة معينة..."
                placeholderTextColor={C.textDim}
                value={state.notes}
                onChangeText={update("notes")}
                multiline
                textAlign="right"
              />
            </View>
          </Section>

          {/* زر الإعادة */}
          <TouchableOpacity style={styles.resetBtn} onPress={reset}>
            <Text style={styles.resetBtnText}>🔄 إعادة ضبط الإعدادات</Text>
          </TouchableOpacity>

          {/* زر عرض الـ Prompt */}
          <TouchableOpacity style={styles.viewPromptBtn} onPress={() => setActiveTab("output")}>
            <Text style={styles.viewPromptBtnText}>✨ عرض الـ Prompt الجاهز</Text>
          </TouchableOpacity>
        </ScrollView>
      ) : (
        /* تبويب الـ Prompt */
        <View style={{ flex: 1 }}>
          <View style={styles.outputHeader}>
            <Text style={styles.outputTitle}>✨ الـ Prompt الجاهز</Text>
            <TouchableOpacity
              onPress={copyPrompt}
              style={[styles.copyBtn, copied && styles.copyBtnCopied]}
            >
              <Text style={[styles.copyBtnText, copied && styles.copyBtnTextCopied]}>
                {copied ? "✓ تم النسخ!" : "نسخ الـ Prompt"}
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.outputBody} contentContainerStyle={{ padding: 16 }}>
            <Text style={styles.outputText}>{prompt}</Text>
          </ScrollView>

          {/* إحصائيات */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNum}>{state.duration}</Text>
              <Text style={styles.statLabel}>دقيقة</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNum}>~{Math.round((state.duration / 10) * 1700)}</Text>
              <Text style={styles.statLabel}>كلمة</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNum}>
                {state.stories.length + state.contemporary_issues.length + state.attachments.length}
              </Text>
              <Text style={styles.statLabel}>خيار محدد</Text>
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

// ═══════════════════════════════════════
//              الأنماط
// ═══════════════════════════════════════
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: C.bg },
  header: {
    alignItems: "center",
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  bismillah: { color: C.goldDim, fontSize: 14, marginBottom: 6, fontStyle: "italic" },
  appTitle: { color: C.goldLight, fontSize: 22, fontWeight: "bold", textAlign: "center" },
  appSubtitle: { color: C.textMuted, fontSize: 12, marginTop: 4, textAlign: "center" },

  tabs: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: C.border },
  tab: { flex: 1, paddingVertical: 12, alignItems: "center" },
  tabActive: { borderBottomWidth: 2, borderBottomColor: C.gold },
  tabText: { color: C.textMuted, fontSize: 14 },
  tabTextActive: { color: C.gold, fontWeight: "bold" },

  scroll: { flex: 1 },

  card: {
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 12,
    marginBottom: 10,
    overflow: "hidden",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    backgroundColor: C.surface2,
    gap: 10,
  },
  cardIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: C.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: { flex: 1, color: C.text, fontSize: 15, fontWeight: "bold", textAlign: "right" },
  cardChevron: { color: C.textDim, fontSize: 12 },
  cardBody: { padding: 14, gap: 12 },

  fieldGroup: { gap: 6, marginBottom: 10 },
  fieldLabel: { color: C.textMuted, fontSize: 13, textAlign: "right" },
  fieldInput: {
    backgroundColor: C.surface2,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 8,
    padding: 10,
    color: C.text,
    fontSize: 14,
  },

  durationRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 6 },
  durationBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.surface2,
  },
  durationBtnSelected: { borderColor: C.gold, backgroundColor: "rgba(201,168,76,0.15)" },
  durationBtnText: { color: C.textMuted, fontSize: 14 },
  durationBtnTextSelected: { color: C.goldLight, fontWeight: "bold" },

  optionsGrid: { flexDirection: "row", flexWrap: "wrap", marginHorizontal: -3 },
  optionBtn: {
    flex: 1,
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.surface2,
    alignItems: "center",
    minHeight: 44,
    justifyContent: "center",
  },
  optionBtnSelected: {
    borderColor: C.gold,
    backgroundColor: "rgba(201,168,76,0.15)",
  },
  optionBtnText: { color: C.textMuted, fontSize: 12, textAlign: "center" },
  optionBtnTextSelected: { color: C.goldLight, fontWeight: "bold" },

  checkboxItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "transparent",
    marginBottom: 4,
  },
  checkboxItemChecked: { backgroundColor: "rgba(201,168,76,0.06)", borderColor: C.goldDim },
  checkboxBox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: C.border,
    backgroundColor: C.surface2,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxBoxChecked: { backgroundColor: C.gold, borderColor: C.gold },
  checkboxTick: { color: "#1a1500", fontSize: 12, fontWeight: "bold" },
  checkboxLabel: { color: C.textMuted, fontSize: 13, flex: 1, textAlign: "right" },
  checkboxLabelChecked: { color: C.text },

  resetBtn: {
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 8,
    padding: 14,
    alignItems: "center",
    marginTop: 8,
  },
  resetBtnText: { color: C.textMuted, fontSize: 14 },

  viewPromptBtn: {
    backgroundColor: C.gold,
    borderRadius: 10,
    padding: 16,
    alignItems: "center",
    marginTop: 10,
  },
  viewPromptBtnText: { color: "#1a1500", fontSize: 16, fontWeight: "bold" },

  outputHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    backgroundColor: C.surface2,
  },
  outputTitle: { color: C.goldLight, fontSize: 16, fontWeight: "bold" },
  copyBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: C.goldDim,
  },
  copyBtnCopied: { borderColor: C.green, backgroundColor: "rgba(74,140,92,0.15)" },
  copyBtnText: { color: C.gold, fontSize: 13, fontWeight: "bold" },
  copyBtnTextCopied: { color: C.greenLight },
  outputBody: { flex: 1, backgroundColor: C.surface },
  outputText: {
    color: C.textMuted,
    fontSize: 13,
    lineHeight: 22,
    textAlign: "right",
    fontFamily: "monospace",
  },

  statsRow: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: C.border,
    backgroundColor: C.surface2,
  },
  statItem: { flex: 1, alignItems: "center", paddingVertical: 12 },
  statNum: { color: C.gold, fontSize: 18, fontWeight: "bold" },
  statLabel: { color: C.textDim, fontSize: 11 },
});
