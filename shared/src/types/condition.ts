/** Types de conditions disponibles dans le pool */
export enum ConditionType {
  /** Jouer obligatoirement la carte Noire la plus grande de la partie ici */
  LARGEST_BLACK = 'LARGEST_BLACK',
  /** Jouer obligatoirement la carte Noire la plus petite de la partie ici */
  SMALLEST_BLACK = 'SMALLEST_BLACK',
  /** Jouer obligatoirement la carte Blanche la plus grande de la partie ici */
  LARGEST_WHITE = 'LARGEST_WHITE',
  /** Jouer obligatoirement la carte Blanche la plus petite de la partie ici */
  SMALLEST_WHITE = 'SMALLEST_WHITE',
  /** Ce cadran doit contenir exactement N cartes */
  EXACT_COUNT = 'EXACT_COUNT',
  /** Les cartes doivent être jouées strictement de gauche à droite (ordre croissant de valeur) */
  STRICT_ORDER = 'STRICT_ORDER',
  /** La somme de ce cadran peut exceptionnellement dépasser 24 */
  SUM_EXCEED_24 = 'SUM_EXCEED_24',
}

/** Paramètres optionnels d'une condition */
export interface ConditionParams {
  /** Pour EXACT_COUNT : nombre exact de cartes attendu */
  exactCount?: number;
}

/** Condition associée à un cadran */
export interface Condition {
  /** Identifiant unique de la condition */
  id: string;
  /** Type de la condition */
  type: ConditionType;
  /** Index du cadran auquel la condition est attachée (0-5) */
  clockFaceIndex: number;
  /** Description lisible par l'utilisateur */
  label: string;
  /** Paramètres supplémentaires selon le type */
  params?: ConditionParams;
}

