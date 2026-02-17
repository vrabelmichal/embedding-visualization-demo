import { create } from 'zustand'
import type { AstronomicalObject } from '../utils/types'
import type { EmbeddingViewState } from '../hooks/useViewState'

interface VisualizationState {
  selected: AstronomicalObject | null
  hovered: { object: AstronomicalObject; x: number; y: number } | null
  legendVisible: boolean
  viewState: EmbeddingViewState | null
  setSelected: (obj: AstronomicalObject | null) => void
  setHovered: (payload: VisualizationState['hovered']) => void
  setLegendVisible: (visible: boolean) => void
  setViewState: (view: EmbeddingViewState) => void
}

export const useVisualizationStore = create<VisualizationState>((set) => ({
  selected: null,
  hovered: null,
  legendVisible: true,
  viewState: null,
  setSelected: (obj) => set({ selected: obj }),
  setHovered: (payload) => set({ hovered: payload }),
  setLegendVisible: (visible) => set({ legendVisible: visible }),
  setViewState: (viewState) => set({ viewState }),
}))
