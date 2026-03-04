/** Couleur d'une carte */
export type CardColor = 'white' | 'black';

/** Valeur possible d'une carte (1 à 12) */
export type CardValue = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

/** Représentation d'une carte du jeu */
export interface Card {
  /** Identifiant unique de la carte */
  id: string;
  /** Valeur de la carte (1-12) */
  value: CardValue;
  /** Couleur de la carte */
  color: CardColor;
  /** Indique si la carte est révélée (face visible) */
  isRevealed: boolean;
  /** Identifiant du joueur ayant joué cette carte (si posée sur le plateau) */
  playedBy?: string;
}

