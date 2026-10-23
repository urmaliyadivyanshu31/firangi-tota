import type { Source, SourceRef } from '../../types'

// Every source this era cites. Page references (loc) were checked against the archive.org
// full texts linked here. Metcalfe 1898 holds two narratives: MH = Mainodin, JL = Jiwan Lal.
export const sources: Source[] = [
  {
    id: 'metcalfe-1898',
    author: 'C. T. Metcalfe (trans.)',
    title: 'Two Native Narratives of the Mutiny in Delhi (Mainodin and Jiwan Lal)',
    year: '1898',
    url: 'https://archive.org/details/b28710812',
  },
  {
    id: 'trial-1858',
    author: 'Military Commission, Delhi (court record; repr. Calcutta 1895)',
    title: 'Proceedings on the Trial of Muhammad Bahadur Shah, titular King of Delhi',
    year: '1858',
    url: 'https://archive.org/details/dli.csl.7785',
  },
  {
    id: 'sen-1957',
    author: 'S. N. Sen',
    title: 'Eighteen Fifty-Seven',
    year: '1957',
    url: 'https://archive.org/details/eighteen-fifty-seven-1857-surendranath-sen',
  },
  {
    id: 'majumdar-1957',
    author: 'R. C. Majumdar',
    title: 'The Sepoy Mutiny and the Revolt of 1857',
    year: '1957',
    url: 'https://archive.org/details/sepoymutiny1857',
  },
  {
    id: 'fanshawe-1902',
    author: 'H. C. Fanshawe',
    title: 'Delhi Past and Present',
    year: '1902',
    url: 'https://archive.org/details/cu31924095603076',
  },
  {
    id: 'cave-browne-1861',
    author: 'J. Cave-Browne',
    title: 'The Punjab and Delhi in 1857, Vol. I',
    year: '1861',
    url: 'https://archive.org/details/in.ernet.dli.2015.13439',
  },
  {
    id: 'hodson-1860',
    author: 'W. S. R. Hodson',
    title: "Twelve Years of a Soldier's Life in India",
    year: '1860',
    url: 'https://archive.org/details/soldierslifeindia00hodsrich',
  },
  {
    id: 'yule-burnell-1903',
    author: 'H. Yule and A. C. Burnell (ed. W. Crooke)',
    title: 'Hobson-Jobson: A Glossary of Anglo-Indian Words and Phrases',
    year: '1903',
    url: 'https://archive.org/details/hobsonjobsonbein00yuleuoft',
  },
  {
    id: 'low-1877',
    author: 'C. R. Low',
    title: 'History of the Indian Navy (1613-1863), Vol. II',
    year: '1877',
    url: 'https://archive.org/details/historyofindiann02lowc',
  },
  {
    id: 'hunter-1885',
    author: 'W. W. Hunter',
    title: 'The Imperial Gazetteer of India, 2nd ed., Vol. I',
    year: '1885',
    url: 'https://archive.org/details/imperialgazettee01hunt_0',
  },
]

// Short helpers so the content files stay readable.
export const mh = (p: string): SourceRef => ({ id: 'metcalfe-1898', loc: `MH ${p}` })
export const jl = (p: string): SourceRef => ({ id: 'metcalfe-1898', loc: `JL ${p}` })
export const trial = (loc: string): SourceRef => ({ id: 'trial-1858', loc })
export const sen = (loc: string): SourceRef => ({ id: 'sen-1957', loc })
export const majumdar = (loc: string): SourceRef => ({ id: 'majumdar-1957', loc })
export const fanshawe = (loc: string): SourceRef => ({ id: 'fanshawe-1902', loc })
export const caveBrowne = (loc: string): SourceRef => ({ id: 'cave-browne-1861', loc })
export const hodson = (loc: string): SourceRef => ({ id: 'hodson-1860', loc })
export const yule = (loc: string): SourceRef => ({ id: 'yule-burnell-1903', loc })
export const low = (loc: string): SourceRef => ({ id: 'low-1877', loc })
export const hunter = (loc: string): SourceRef => ({ id: 'hunter-1885', loc })

// Trial-record locations used more than once.
export const CHUNI_17 = "Chuni Lal's news diary, 17 May 1857, c. pp.112-13"
export const CHUNI_18 = "Chuni Lal's news diary, 18 May 1857, c. p.113"
export const CHUNI_19_20 = "Chuni Lal's news diary, 19-20 May 1857, c. pp.113-15"
export const KING_ORDER = 'undated order of the King to Mirza Mughal, c. pp.131-35'
export const CHATTA = 'Petition No. 52, shopkeepers of the Chatta, undated, c. p.25'
