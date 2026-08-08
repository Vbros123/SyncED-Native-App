import es from './es.js'
import hi from './hi.js'
import ar from './ar.js'
import fr from './fr.js'
import { lessonExpansion } from './lessonExpansion.js'

export const extendedMessages = {
  es: { ...es, ...lessonExpansion.es },
  hi: { ...hi, ...lessonExpansion.hi },
  ar: { ...ar, ...lessonExpansion.ar },
  fr: { ...fr, ...lessonExpansion.fr },
}
