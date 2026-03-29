import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { BarChart3, Bus, Clock, ArrowRight, Brain, Sun, Moon, Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import heroImg from "@/assets/hero-transport.jpg";

// ── Translations ──────────────────────────────────────────────
const translations = {
  en: {
    tagline: "AI-Powered Transit",
    heroTitle1: "Smart Transport",
    heroTitle2: "Occupancy Prediction",
    heroDesc:
      "Predict crowd levels in buses and trains using AI. Optimize your travel by forecasting passenger density with machine learning.",
    getStarted: "Get Started",
    learnMore: "Learn More",
    featuresLabel: "Features",
    featuresTitle: "Why Choose TransitAI?",
    ctaTitle: "Ready to Predict?",
    ctaDesc:
      "Start making smarter travel decisions with AI-powered occupancy predictions.",
    startPrediction: "Start Prediction",
    footer: "© 2026 TransitAI. Smart Transport Occupancy Prediction.",
    features: [
      {
        title: "Predict Occupancy",
        description:
          "AI-powered passenger density forecasting using historical and real-time data.",
      },
      {
        title: "Smart Scheduling",
        description:
          "Optimize your travel plans by choosing the best time to commute.",
      },
      {
        title: "Real-Time Insights",
        description:
          "Get instant predictions and live occupancy updates at your fingertips.",
      },
    ],
  },
  te: {
    tagline: "AI-ఆధారిత రవాణా",
    heroTitle1: "స్మార్ట్ రవాణా",
    heroTitle2: "ఆక్యుపెన్సీ అంచనా",
    heroDesc:
      "AI ఉపయోగించి బస్సులు మరియు రైళ్లలో జనసమ్మర్థ స్థాయిలను అంచనా వేయండి. మెషిన్ లెర్నింగ్‌తో ప్రయాణాన్ని మెరుగుపరచుకోండి.",
    getStarted: "ప్రారంభించండి",
    learnMore: "మరింత తెలుసుకోండి",
    featuresLabel: "విశేషాలు",
    featuresTitle: "TransitAI ఎందుకు ఎంచుకోవాలి?",
    ctaTitle: "అంచనా వేయడానికి సిద్ధంగా ఉన్నారా?",
    ctaDesc:
      "AI-ఆధారిత ఆక్యుపెన్సీ అంచనాలతో తెలివైన ప్రయాణ నిర్ణయాలు తీసుకోండి.",
    startPrediction: "అంచనా ప్రారంభించండి",
    footer: "© 2026 TransitAI. స్మార్ట్ రవాణా ఆక్యుపెన్సీ అంచనా.",
    features: [
      {
        title: "ఆక్యుపెన్సీ అంచనా",
        description:
          "చారిత్రక మరియు రియల్-టైమ్ డేటా ఉపయోగించి AI-ఆధారిత యాత్రికుల సాంద్రత అంచనా.",
      },
      {
        title: "స్మార్ట్ షెడ్యూలింగ్",
        description:
          "ప్రయాణించడానికి అత్యుత్తమ సమయాన్ని ఎంచుకోవడం ద్వారా మీ ప్రయాణ ప్రణాళికలను మెరుగుపరచుకోండి.",
      },
      {
        title: "రియల్-టైమ్ అంతర్దృష్టులు",
        description:
          "తక్షణ అంచనాలు మరియు లైవ్ ఆక్యుపెన్సీ అప్‌డేట్‌లు మీ చేతిలో పొందండి.",
      },
    ],
  },
  hi: {
    tagline: "AI-संचालित पारगमन",
    heroTitle1: "स्मार्ट परिवहन",
    heroTitle2: "अधिभोग पूर्वानुमान",
    heroDesc:
      "AI का उपयोग करके बसों और ट्रेनों में भीड़ के स्तर का अनुमान लगाएं। मशीन लर्निंग के साथ यात्री घनत्व का पूर्वानुमान करके अपनी यात्रा को अनुकूलित करें।",
    getStarted: "शुरू करें",
    learnMore: "और जानें",
    featuresLabel: "विशेषताएं",
    featuresTitle: "TransitAI क्यों चुनें?",
    ctaTitle: "पूर्वानुमान के लिए तैयार हैं?",
    ctaDesc:
      "AI-संचालित अधिभोग पूर्वानुमानों के साथ स्मार्ट यात्रा निर्णय लेना शुरू करें।",
    startPrediction: "पूर्वानुमान शुरू करें",
    footer: "© 2026 TransitAI. स्मार्ट परिवहन अधिभोग पूर्वानुमान।",
    features: [
      {
        title: "अधिभोग पूर्वानुमान",
        description:
          "ऐतिहासिक और रीयल-टाइम डेटा का उपयोग करके AI-संचालित यात्री घनत्व पूर्वानुमान।",
      },
      {
        title: "स्मार्ट शेड्यूलिंग",
        description:
          "आने-जाने के लिए सबसे अच्छा समय चुनकर अपनी यात्रा योजनाओं को अनुकूलित करें।",
      },
      {
        title: "रीयल-टाइम अंतर्दृष्टि",
        description:
          "तत्काल पूर्वानुमान और लाइव अधिभोग अपडेट अपनी उंगलियों पर पाएं।",
      },
    ],
  },
} as const;

type Lang = keyof typeof translations;

// ── Feature icons (order matches translation arrays) ──────────
const featureIcons = [BarChart3, Bus, Clock];

// ── Animation variants (unchanged) ───────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.6, ease: "easeOut" },
  }),
};

// ── Component ─────────────────────────────────────────────────
const LandingPage = () => {
  const navigate = useNavigate();

  // Theme
  const [isDark, setIsDark] = useState(true);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  // Language
  const [lang, setLang] = useState<Lang>("en");
  const t = translations[lang];

  const cycleLang = () => {
    const order: Lang[] = ["en", "te", "hi"];
    setLang((prev) => order[(order.indexOf(prev) + 1) % order.length]);
  };

  const langLabel: Record<Lang, string> = { en: "EN", te: "తె", hi: "हि" };

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* ── Header ── */}
      <header className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-border/30">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg gradient-primary flex items-center justify-center">
              <Brain className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-lg text-foreground">TransitAI</span>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            {/* Language toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={cycleLang}
              className="flex items-center gap-1.5 min-w-[72px] font-semibold"
              title="Switch language"
            >
              <Languages className="w-4 h-4" />
              {langLabel[lang]}
            </Button>

            {/* Dark / Light toggle */}
            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsDark((d) => !d)}
              className="w-9 h-9"
              title={isDark ? "Switch to light mode" : "Switch to dark mode"}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>

            {/* Get Started */}
            <Button
              onClick={() => navigate("/select")}
              className="gradient-primary border-0 text-primary-foreground hover:opacity-90 transition-opacity"
            >
              {t.getStarted}
            </Button>
          </div>
        </div>
      </header>

      {/* ── Hero Section ── */}
      <section className="pt-32 pb-20 px-6">
        <div className="container mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
          >
            <p className="text-primary font-semibold text-sm uppercase tracking-widest mb-4">
              {t.tagline}
            </p>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6">
              {t.heroTitle1}{" "}
              <span className="gradient-text">{t.heroTitle2}</span>
            </h1>
            <p className="text-muted-foreground text-lg md:text-xl leading-relaxed mb-8 max-w-lg">
              {t.heroDesc}
            </p>
            <div className="flex flex-wrap gap-4">
              <Button
                size="lg"
                onClick={() => navigate("/select")}
                className="gradient-primary border-0 text-primary-foreground hover:opacity-90 transition-opacity text-base px-8 glow-primary"
              >
                {t.getStarted}
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-base px-8"
                onClick={() =>
                  document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })
                }
              >
                {t.learnMore}
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative"
          >
            <div className="absolute inset-0 gradient-primary rounded-2xl blur-3xl opacity-20 scale-90" />
            <img
              src={heroImg}
              alt="AI-powered public transport prediction system"
              className="relative rounded-2xl shadow-2xl w-full"
              width={1280}
              height={720}
            />
          </motion.div>
        </div>
      </section>

      {/* ── Features Section ── */}
      <section id="features" className="py-20 px-6">
        <div className="container mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="text-center mb-16"
          >
            <motion.p
              variants={fadeUp}
              custom={0}
              className="text-primary font-semibold text-sm uppercase tracking-widest mb-3"
            >
              {t.featuresLabel}
            </motion.p>
            <motion.h2
              variants={fadeUp}
              custom={1}
              className="font-display text-3xl md:text-4xl font-bold text-foreground"
            >
              {t.featuresTitle}
            </motion.h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {t.features.map((feature, i) => {
              const Icon = featureIcons[i];
              return (
                <motion.div
                  key={feature.title}
                  custom={i}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-50px" }}
                  variants={fadeUp}
                  className="glass-card rounded-2xl p-8 text-center hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
                >
                  <div className="w-14 h-14 rounded-xl gradient-primary flex items-center justify-center mx-auto mb-5 group-hover:animate-pulse-glow transition-shadow">
                    <Icon className="w-7 h-7 text-primary-foreground" />
                  </div>
                  <h3 className="font-display text-xl font-semibold text-foreground mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── CTA Section ── */}
      <section className="py-20 px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="container mx-auto max-w-3xl gradient-primary rounded-3xl p-12 md:p-16 text-center relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent)]" />
          <div className="relative z-10">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
              {t.ctaTitle}
            </h2>
            <p className="text-primary-foreground/80 text-lg mb-8 max-w-md mx-auto">
              {t.ctaDesc}
            </p>
            <Button
              size="lg"
              onClick={() => navigate("/select")}
              className="bg-card text-foreground hover:bg-card/90 text-base px-10 font-semibold"
            >
              {t.startPrediction}
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </motion.div>
      </section>

      {/* ── Footer ── */}
      <footer className="py-8 px-6 border-t border-border">
        <div className="container mx-auto text-center text-muted-foreground text-sm">
          {t.footer}
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;