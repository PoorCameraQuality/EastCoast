'use client'

import { useEffect, useRef } from 'react'
import useComprehensiveTracking from '@/hooks/useComprehensiveTracking'

interface FormTrackerProps {
  formId: string
  children: React.ReactNode
}

export default function FormTracker({ formId, children }: FormTrackerProps) {
  const { trackFormField } = useComprehensiveTracking()
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    const form = formRef.current
    if (!form) return

    const handleFieldFocus = (e: FocusEvent) => {
      const target = e.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT')) {
        trackFormField(formId, target.name || target.id || 'unknown', 'focus')
      }
    }

    const handleFieldBlur = (e: FocusEvent) => {
      const target = e.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT')) {
        trackFormField(formId, target.name || target.id || 'unknown', 'blur')
      }
    }

    const handleFieldInput = (e: Event) => {
      const target = e.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT')) {
        trackFormField(formId, target.name || target.id || 'unknown', 'input')
      }
    }

    const handleFormSubmit = (e: SubmitEvent) => {
      const formData = new FormData(form)
      const fieldNames = Array.from(formData.keys())
      
      fieldNames.forEach(fieldName => {
        trackFormField(formId, fieldName, 'submit')
      })
    }

    const handleFormAbandon = () => {
      const inputs = form.querySelectorAll('input, textarea, select')
      inputs.forEach((input: Element) => {
        const htmlInput = input as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        if (htmlInput.value && !htmlInput.disabled) {
          trackFormField(formId, htmlInput.name || htmlInput.id || 'unknown', 'abandon')
        }
      })
    }

    // Add event listeners
    form.addEventListener('focusin', handleFieldFocus)
    form.addEventListener('focusout', handleFieldBlur)
    form.addEventListener('input', handleFieldInput)
    form.addEventListener('submit', handleFormSubmit)

    // Track form abandonment on page unload
    window.addEventListener('beforeunload', handleFormAbandon)

    return () => {
      form.removeEventListener('focusin', handleFieldFocus)
      form.removeEventListener('focusout', handleFieldBlur)
      form.removeEventListener('input', handleFieldInput)
      form.removeEventListener('submit', handleFormSubmit)
      window.removeEventListener('beforeunload', handleFormAbandon)
    }
  }, [formId, trackFormField])

  return (
    <form ref={formRef}>
      {children}
    </form>
  )
}
