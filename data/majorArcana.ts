export type ArcanaCard = {
  id: number;
  ko: string;
  en: string;
  han: string;   // single hanja sigil (used on card face + reveal headings)
  keywords: { upright: string[]; reversed: string[] };
};

export const majorArcana: ArcanaCard[] = [
  { id: 0,  ko: '바보',         en: 'The Fool',           han: '愚', keywords: { upright: ['시작','순수','모험'],     reversed: ['무모','경솔','지연'] } },
  { id: 1,  ko: '마법사',       en: 'The Magician',       han: '術', keywords: { upright: ['의지','능력','집중'],     reversed: ['속임','산만','오용'] } },
  { id: 2,  ko: '여사제',       en: 'The High Priestess', han: '巫', keywords: { upright: ['직관','내면','비밀'],     reversed: ['혼란','억압','단절'] } },
  { id: 3,  ko: '여황제',       en: 'The Empress',        han: '后', keywords: { upright: ['풍요','돌봄','창조'],     reversed: ['의존','정체','부재'] } },
  { id: 4,  ko: '황제',         en: 'The Emperor',        han: '皇', keywords: { upright: ['권위','구조','안정'],     reversed: ['독단','경직','약함'] } },
  { id: 5,  ko: '교황',         en: 'The Hierophant',     han: '師', keywords: { upright: ['전통','학습','지혜'],     reversed: ['저항','맹신','이탈'] } },
  { id: 6,  ko: '연인',         en: 'The Lovers',         han: '緣', keywords: { upright: ['결합','선택','조화'],     reversed: ['불화','우유부단','단절'] } },
  { id: 7,  ko: '전차',         en: 'The Chariot',        han: '進', keywords: { upright: ['추진','승리','통제'],     reversed: ['혼란','정체','폭주'] } },
  { id: 8,  ko: '힘',           en: 'Strength',           han: '力', keywords: { upright: ['용기','인내','자제'],     reversed: ['약함','폭발','두려움'] } },
  { id: 9,  ko: '은둔자',       en: 'The Hermit',         han: '隱', keywords: { upright: ['성찰','고독','통찰'],     reversed: ['고립','거부','어둠'] } },
  { id: 10, ko: '운명의 수레바퀴', en: 'Wheel of Fortune', han: '輪', keywords: { upright: ['전환','기회','순환'],     reversed: ['역행','정체','악순환'] } },
  { id: 11, ko: '정의',         en: 'Justice',            han: '正', keywords: { upright: ['공정','진실','균형'],     reversed: ['편파','회피','부정'] } },
  { id: 12, ko: '매달린 사람',  en: 'The Hanged Man',     han: '懸', keywords: { upright: ['전환점','내려놓음','시야'], reversed: ['정체','희생강요','회피'] } },
  { id: 13, ko: '죽음',         en: 'Death',              han: '死', keywords: { upright: ['끝과 시작','변형','해방'], reversed: ['집착','두려움','지연'] } },
  { id: 14, ko: '절제',         en: 'Temperance',         han: '節', keywords: { upright: ['조율','중용','회복'],     reversed: ['불균형','과잉','단절'] } },
  { id: 15, ko: '악마',         en: 'The Devil',          han: '魔', keywords: { upright: ['집착','속박','유혹'],     reversed: ['해방','자각','단절'] } },
  { id: 16, ko: '탑',           en: 'The Tower',          han: '塔', keywords: { upright: ['붕괴','각성','전환'],     reversed: ['지연된 붕괴','부정','내적 충격'] } },
  { id: 17, ko: '별',           en: 'The Star',           han: '星', keywords: { upright: ['희망','회복','영감'],     reversed: ['실망','자기의심','정체'] } },
  { id: 18, ko: '달',           en: 'The Moon',           han: '月', keywords: { upright: ['직감','환영','불확실'],   reversed: ['혼란해소','진실','두려움 직면'] } },
  { id: 19, ko: '태양',         en: 'The Sun',            han: '日', keywords: { upright: ['활력','성취','명료'],     reversed: ['일시적 흐림','과열','자만'] } },
  { id: 20, ko: '심판',         en: 'Judgement',          han: '審', keywords: { upright: ['각성','부름','정리'],     reversed: ['자책','지연','거부'] } },
  { id: 21, ko: '세계',         en: 'The World',          han: '世', keywords: { upright: ['완성','성취','통합'],     reversed: ['미완','지연','정체'] } },
];

if (majorArcana.length !== 22) {
  throw new Error(`majorArcana must have 22 cards, got ${majorArcana.length}`);
}
