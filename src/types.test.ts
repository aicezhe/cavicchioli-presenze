import { describe, it, expect } from 'vitest'
import {
  DEFAULT_SCHOOL_COLOR,
  makeClassName,
  makeColorClassName,
  schoolColor,
  schoolInitials,
} from './types'

// Test dei helper puri di dominio: nome/colore/iniziali scuola e nome classe.
// Sono funzioni deterministiche senza dipendenze (niente Firebase/DOM), quindi
// facili da coprire e utili come rete di sicurezza sulle regole di fallback.

describe('schoolColor', () => {
  it('usa il colore della scuola quando presente', () => {
    expect(schoolColor({ primaryColor: '#B5654A' })).toBe('#B5654A')
  })

  it('ripiega sul colore di piattaforma quando manca', () => {
    expect(schoolColor({})).toBe(DEFAULT_SCHOOL_COLOR)
    expect(schoolColor({ primaryColor: '' })).toBe(DEFAULT_SCHOOL_COLOR)
  })
})

describe('schoolInitials', () => {
  it('usa le iniziali impostate se presenti', () => {
    expect(schoolInitials({ name: 'Scuola Primaria "Dante Alighieri"', emblemInitials: 'DA' })).toBe('DA')
  })

  it('deriva le iniziali dalle prime due parole del nome', () => {
    expect(schoolInitials({ name: 'Aldo Moro' })).toBe('AM')
    expect(schoolInitials({ name: 'liceo scientifico enrico fermi' })).toBe('LS')
  })

  it('ripiega su "—" per un nome vuoto', () => {
    expect(schoolInitials({ name: '' })).toBe('—')
  })
})

describe('nome della classe', () => {
  it('compone il nome numerico anno + sezione', () => {
    expect(makeClassName(2, 'B')).toBe('2ª B')
  })

  it('compone il nome a colori', () => {
    expect(makeColorClassName('Blu')).toBe('Sezione Blu')
  })
})
