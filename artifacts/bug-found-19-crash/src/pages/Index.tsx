import { useState, useEffect, useCallback } from "react";
import Calculator from "@/components/Calculator";
import WelcomeScreen from "@/components/WelcomeScreen";
import VerticalPages from "@/components/VerticalPages";
import SkillPage from "@/components/SkillPage";
import StatsPage from "@/components/StatsPage";
import ComingSoonPage from "@/components/ComingSoonPage";
import XpAnimation from "@/components/XpAnimation";
import Clock from "@/components/Clock";
import type { Skill, StatType, StatsData } from "@/types/skill";
import { DEFAULT_STATS } from "@/types/skill";
import type { XpEvent } from "@/components/XpAnimation";

const SKILLS_KEY = "skills_data";
const STATS_KEY = "stats_data";

const Index = () => {
  const [showWelcome, setShowWelcome] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);

  // ── Skills persistence ──
  const [skills, setSkills] = useState<Skill[]>(() => {
    try {
      const saved = localStorage.getItem(SKILLS_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // ── Stats persistence ──
  const [stats, setStats] = useState<StatsData>(() => {
    try {
      const saved = localStorage.getItem(STATS_KEY);
      return saved ? { ...DEFAULT_STATS, ...JSON.parse(saved) } : { ...DEFAULT_STATS };
    } catch {
      return { ...DEFAULT_STATS };
    }
  });

  const [loadedSkill, setLoadedSkill] = useState<Skill | null>(null);
  const [xpEvents, setXpEvents] = useState<XpEvent[]>([]);

  useEffect(() => {
    localStorage.setItem(SKILLS_KEY, JSON.stringify(skills));
  }, [skills]);

  useEffect(() => {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  }, [stats]);

  // ── Skill CRUD ──
  const handleSkillAdd = useCallback((skill: Skill) => {
    setSkills((prev) => [...prev, skill]);
  }, []);

  const handleSkillUpdate = useCallback((updated: Skill) => {
    setSkills((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
  }, []);

  const handleSkillDelete = useCallback((id: string) => {
    setSkills((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const handleSkillReorder = useCallback((newOrder: Skill[]) => {
    setSkills(newOrder);
  }, []);

  const handleSkillClick = useCallback((skill: Skill) => {
    setLoadedSkill(skill);
  }, []);

  const handleClearLoaded = useCallback(() => {
    setLoadedSkill(null);
  }, []);

  // ── Giorni change → stats delta + XP animation ──
  const handleGiorniChange = useCallback((_skillId: string, stats: StatType[], delta: number) => {
    setStats((prev) => {
      const next = { ...prev };
      for (const stat of stats) {
        next[stat] = Math.round((next[stat] + delta * 0.1) * 10) / 10;
      }
      return next;
    });
    for (const stat of stats) {
      setXpEvents((prev) => [...prev, { id: crypto.randomUUID(), stat, delta }]);
    }
  }, []);

  return (
    <div className="min-h-screen hex-grid-bg animate-flicker">
      <Clock />
      <WelcomeScreen visible={showWelcome} onDismiss={() => setShowWelcome(false)} />

      <XpAnimation events={xpEvents} />

      <VerticalPages onPageChange={setCurrentPage}>
        <SkillPage skills={skills} onDelete={handleSkillDelete} onSkillClick={handleSkillClick} onReorder={handleSkillReorder} />
        <StatsPage stats={stats} />
        <ComingSoonPage />
      </VerticalPages>

      <Calculator
        visible={currentPage === 0}
        skills={skills}
        onSkillAdd={handleSkillAdd}
        onSkillUpdate={handleSkillUpdate}
        onGiorniChange={handleGiorniChange}
        loadedSkill={loadedSkill}
        onClearLoaded={handleClearLoaded}
      />
    </div>
  );
};

export default Index;
