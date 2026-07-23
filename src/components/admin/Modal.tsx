import type { ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

type ModalProps = {
  open: boolean
  title: string
  onClose: () => void
  children: ReactNode
}

/** Modale semplice: a schermo intero su mobile, centrata su desktop. Senza librerie esterne. */
export default function Modal({ open, title, onClose, children }: ModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex sm:items-center justify-center bg-ink/40 sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-cream w-full h-full sm:h-auto sm:max-w-md sm:rounded-2xl
                       shadow-xl flex flex-col overflow-hidden"
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 24, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-dustyblue/40 px-5 py-4">
              <h2 className="font-serif text-lg font-semibold">{title}</h2>
              <button
                onClick={onClose}
                aria-label="Chiudi"
                className="text-warmgray hover:text-dustyblue transition-colors text-xl leading-none"
              >
                &times;
              </button>
            </div>
            <div className="p-5 overflow-y-auto">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
