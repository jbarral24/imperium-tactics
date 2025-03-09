// types.ts
export interface Match {
  id: string
  status: string
  created_at: string
  player1_id: string
  player2_id: string | null
  total_units: number
  match_title: string
}

export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  isLoading: boolean
  onSubmit: (name: string, totalUnits: number) => void
}

export interface ButtonProps {
  onClick: () => void
  disabled?: boolean
  className?: string
  title?: string
  children: React.ReactNode
}

export interface LoadingButtonProps extends ButtonProps {
  isLoading: boolean
  loadingText: string
  icon?: React.ReactNode
}
