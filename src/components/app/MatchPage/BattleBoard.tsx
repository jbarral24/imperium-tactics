import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useSubscription, useMutation } from '@apollo/client'
import { PIECES_SUBSCRIPTION, update_pieces_by_pk } from '@/graphql/matches'
import BoardCell from './BoardCell'
import DraggablePiece, { Piece } from './DraggablePiece'

const BattleBoard: React.FC = () => {
  const { matchId } = useParams<{ matchId: string }>()
  const size = 20
  const [pieceMap, setPieceMap] = useState<Record<string, Piece>>({})
  const [selectedPiece, setSelectedPiece] = useState<Piece | null>(null)

  // Suscripción a las piezas
  const { data, loading, error } = useSubscription(PIECES_SUBSCRIPTION, {
    variables: { matchId },
    onError: (error) => console.error('Error en la suscripción de piezas:', error),
  })

  useEffect(() => {
    if (data && data.pieces) {
      const newPieceMap: Record<string, Piece> = {}
      data.pieces.forEach((piece: Piece) => {
        const key = `${piece.pos_x}-${piece.pos_y}`
        newPieceMap[key] = piece
      })
      setPieceMap(newPieceMap)
    }
  }, [data])

  // Mutation para actualizar la posición de la pieza en la BD
  const [updatePiecePosition] = useMutation(update_pieces_by_pk)

  const handlePieceDrop = async (pieceId: string, newX: number, newY: number) => {
    try {
      await updatePiecePosition({
        variables: { id: pieceId, pos_x: newX, pos_y: newY },
      })
      console.log('Posición actualizada')
    } catch (err) {
      console.error('Error al actualizar la posición de la pieza:', err)
    }
  }

  const handleSelectPiece = (piece: Piece) => {
    setSelectedPiece(piece)
  }

  const handleClearSelection = () => {
    setSelectedPiece(null)
  }

  const renderPiece = (piece: Piece) => {
    let bgColor, borderColor, icon

    if (piece.type === 'melee') {
      bgColor = 'bg-red-900'
      borderColor = 'border-red-700'
      icon = '✖'
    } else if (piece.type === 'rango') {
      bgColor = 'bg-blue-900'
      borderColor = 'border-blue-700'
      icon = '◎'
    } else if (piece.type === 'normal') {
      bgColor = 'bg-amber-800'
      borderColor = 'border-amber-600'
      icon = '⋯'
    }

    return (
      <div
        className={`absolute inset-0.5 ${bgColor} rounded-full flex items-center justify-center text-white font-bold border-2 ${borderColor} shadow-inner overflow-hidden`}
        title={`${piece.type.toUpperCase()} | HP: ${piece.hp} | Rango: ${piece.range} | Mov: ${piece.movement}`}
      >
        <span className="text-xs">{icon}</span>
      </div>
    )
  }

  // Generar las celdas del tablero
  const cells = []
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const key = `${x}-${y}`
      const piece = pieceMap[key]

      cells.push(
        <BoardCell
          key={key}
          x={x}
          y={y}
          onPieceDrop={handlePieceDrop}
          onEmptyCellClick={handleClearSelection}
        >
          {piece && (
            <DraggablePiece
              piece={piece}
              renderPiece={renderPiece}
              onSelect={handleSelectPiece}
            />
          )}
        </BoardCell>
      )
    }
  }

  return (
    <div>
      <div className="inline-block border-2 border-gray-700 bg-black/80 p-2 rounded shadow-lg relative">
        {loading && (
          <div className="absolute inset-0 bg-black/70 flex items-center justify-center text-amber-500 z-10">
            <div className="flex flex-col items-center">
              <svg className="animate-spin h-8 w-8 mb-2" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <span className="font-bold">Conectando al campo de batalla...</span>
            </div>
          </div>
        )}
        {error && (
          <div className="absolute inset-0 bg-black/70 flex items-center justify-center text-red-500 z-10">
            <div className="flex flex-col items-center">
              <svg className="h-8 w-8 mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <span className="font-bold">
                Error en la transmisión de datos del campo de batalla
              </span>
            </div>
          </div>
        )}
        <div className="grid grid-cols-20 gap-0">{cells}</div>
      </div>

      {/* Panel con las estadísticas de la ficha seleccionada */}
      {selectedPiece && (
        <div className="mt-4 p-4 border border-gray-700 bg-gray-900 rounded shadow-lg">
          <h3 className="text-lg font-bold text-amber-500">Estadísticas de la Unidad</h3>
          <p className="text-white">Tipo: {selectedPiece.type}</p>
          <p className="text-white">HP: {selectedPiece.hp}</p>
          <p className="text-white">Rango: {selectedPiece.range}</p>
          <p className="text-white">Movimiento: {selectedPiece.movement}</p>
          {/* Aquí podrías usar imágenes o íconos de alguna librería para emular 40k */}
        </div>
      )}
    </div>
  )
}

export default BattleBoard
