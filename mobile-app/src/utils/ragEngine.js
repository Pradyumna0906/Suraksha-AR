// Local keyword-matched training reference cards. This is not an AI service or a legal source.

const HINDI_NOTICE = 'प्रशिक्षण संकेत मात्र: साइट SOP और योग्य पर्यवेक्षक के साथ कार्रवाई की पुष्टि करें। यह लाइव सलाह, कानूनी स्रोत या कार्य अनुमति नहीं है।';
const SANTALI_NOTICE = 'ᱴᱨᱮᱱᱤᱝ ᱥᱤᱜᱽᱱᱟᱞ ᱮᱠᱮᱱ: ᱥᱟᱭᱤᱴ SOP ᱟᱨ ᱠᱟᱹᱯᱟᱹᱵᱽᱞ ᱥᱩᱯᱚᱨᱵᱷᱟᱭᱡᱚᱨ ᱥᱟᱶ ᱯᱩᱥᱴᱟᱹᱣ ᱢᱮ। ᱱᱚᱣᱟ ᱞᱟᱭᱤᱵ ᱥᱟᱞᱟᱦ ᱵᱟᱝ।';

export const SAFETY_REFERENCE_CARDS = [
  {
    id: 'methane',
    title: 'Methane response training prompt',
    category: 'gas', severity: 'critical',
    keywords: ['methane', 'ch4', 'gas', 'inflammable', 'मीथेन', 'गैस', 'ᱜᱮᱥ', 'leak', 'fire damp'],
    contentEn: 'Training prompt only: recognise a gas-warning scenario, stop the practice activity, and review the response with a qualified supervisor. Do not use simulated values as operational thresholds; follow the current site SOP.'
  },
  {
    id: 'toxic-atmosphere',
    title: 'Toxic-atmosphere response training prompt',
    category: 'gas', severity: 'critical',
    keywords: ['carbon monoxide', 'co', 'toxic', 'poison', 'कार्बन', 'गैस', 'poisonous', 'asphyxia'],
    contentEn: 'Training prompt only: identify a possible toxic-atmosphere scenario and discuss the site emergency procedure, approved respiratory protection, and escalation route with a qualified supervisor.'
  },
  {
    id: 'fire',
    title: 'Fire-response training prompt',
    category: 'fire', severity: 'high',
    keywords: ['fire', 'extinguisher', 'pass', 'dcp', 'co2', 'आग', 'अग्निशामक', 'ᱥᱮᱸᱜᱮᱞ', 'flame'],
    contentEn: 'Training prompt only: practise the P.A.S.S. sequence in this simulation, then confirm extinguisher selection and emergency action with the current site procedure and a qualified trainer.'
  },
  {
    id: 'loto',
    title: 'LOTO training prompt',
    category: 'machinery', severity: 'critical',
    keywords: ['loto', 'lockout', 'tagout', 'conveyor', 'belt', 'machinery', 'मशीन', 'बेल्ट', 'ᱢᱮᱥᱤᱱ'],
    contentEn: 'Training prompt only: rehearse the order of isolation, locking, tagging, and verification. Never perform maintenance from this demonstration; use the approved site LOTO procedure.'
  },
  {
    id: 'ppe',
    title: 'Respiratory-PPE training prompt',
    category: 'ppe', severity: 'high',
    keywords: ['scba', 'mask', 'respirator', 'oxygen', 'मास्क', 'ऑक्सीजन', 'ᱢᱟᱥᱠ', 'ppe'],
    contentEn: 'Training prompt only: identify respiratory-PPE concepts and discuss inspection requirements with an authorised site trainer. This prototype does not assess equipment readiness.'
  },
  {
    id: 'blasting',
    title: 'Blasting-safety training prompt',
    category: 'blasting', severity: 'critical',
    keywords: ['blast', 'blasting', 'explosive', 'dynamite', 'विस्फोट', 'बारूद', 'ᱵᱟᱨᱩᱫᱽ', 'shotfire'],
    contentEn: 'Training prompt only: identify that blasting requires a controlled exclusion procedure. Use the site blast plan and authorised supervisor instructions for any real operation.'
  },
  {
    id: 'electrical',
    title: 'Electrical-equipment training prompt',
    category: 'machinery', severity: 'high',
    keywords: ['electric', 'flameproof', 'flp', 'power', 'shock', 'बिजली', 'तार', 'ᱵᱤᱡᱽᱞᱤ'],
    contentEn: 'Training prompt only: identify electrical-equipment and isolation concepts. Equipment approval and electrical protection settings must be verified through the authorised site process.'
  },
  {
    id: 'first-aid',
    title: 'First-aid training prompt',
    category: 'rescue', severity: 'info',
    keywords: ['first aid', 'cpr', 'injury', 'rescue', 'प्राथमिक उपचार', 'चोट', 'ᱨᱟᱱ', 'heat'],
    contentEn: 'Training prompt only: recognise that an injury or exposure needs the site emergency procedure and qualified first-aid or emergency-service response. This prototype is not medical guidance.'
  }
].map(card => ({ ...card, actCitation: 'Training reference — validate against the site SOP' }));

// Offline keyword matching for prototype reference cards.
export function retrieveSafetyReference(userQuery, lang = 'hi', topK = 2) {
  const query = (userQuery || '').toLowerCase().trim();
  if (!query) return null;

  const tokens = query.split(/\s+/).filter(token => token.length > 1);
  const scoredCards = SAFETY_REFERENCE_CARDS.map(card => {
    const keywordScore = card.keywords.reduce((score, keyword) => score + (query.includes(keyword.toLowerCase()) ? 3 : 0), 0);
    const textScore = tokens.reduce((score, token) => score + (card.contentEn.toLowerCase().includes(token) ? 1 : 0), 0);
    return { card, score: keywordScore + textScore };
  }).sort((a, b) => b.score - a.score);

  const bestMatch = scoredCards[0];
  if (!bestMatch || bestMatch.score === 0) return null;

  return {
    success: true,
    topKCards: scoredCards.slice(0, topK).map(item => item.card),
    actCitation: bestMatch.card.actCitation,
    title: bestMatch.card.title,
    severity: bestMatch.card.severity,
    category: bestMatch.card.category,
    synthesizedTextEn: bestMatch.card.contentEn,
    synthesizedTextHi: HINDI_NOTICE,
    synthesizedTextSat: SANTALI_NOTICE
  };
}
