import React, { useState } from "react";
import { ArrowLeft, ShieldAlert } from "lucide-react";
import { MOCK_MY_REGISTRATIONS } from "../../data/mockFeedback";
import FeedbackForm from "./FeedbackForm";
import FeedbackSuccess from "./FeedbackSuccess";

/**
 * EventFeedback
 * Route: /events/:eventId/feedback (or rendered as a modal from
 * My Registrations).
 *
 * Eligibility is derived from the student's registration record:
 * registered + event completed + no existing feedback.
 */
export default function EventFeedback({
  eventId,
  registrations = MOCK_MY_REGISTRATIONS,
  onSubmitFeedback,
  onBack,
}) {
  const registration = registrations.find((r) => r.eventId === eventId);
  const [justSubmitted, setJustSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const isEligible = registration?.status === "completed" && registration?.attended;
  const alreadySubmitted = registration?.feedbackSubmitted;

  const handleSubmit = async (payload) => {
    setSubmitting(true);
    try {
      await onSubmitFeedback?.({
        eventId,
        studentRegistrationId: registration?.id,
        ...payload,
      });
      setJustSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft size={16} />
        Back to My Registrations
      </button>

      {!isEligible && !alreadySubmitted ? (
        <div className="flex flex-col items-center justify-center text-center py-16 px-6 rounded-2xl bg-white/5 border border-white/10">
          <div className="h-14 w-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-4">
            <ShieldAlert size={24} className="text-slate-500" />
          </div>
          <h2 className="text-lg font-bold text-white mb-1">Feedback Unavailable</h2>
          <p className="text-sm text-slate-400 max-w-sm">
            You can submit feedback only after attending or completing an eligible event.
          </p>
        </div>
      ) : alreadySubmitted || justSubmitted ? (
        <FeedbackSuccess onBack={onBack} alreadySubmitted={alreadySubmitted && !justSubmitted} />
      ) : (
        <>
          <div className="mb-6">
            <h1 className="text-xl font-bold text-white mb-1">How was your experience?</h1>
            <p className="text-sm text-slate-400">{registration.eventTitle}</p>
          </div>
          <FeedbackForm onSubmit={handleSubmit} submitting={submitting} />
        </>
      )}
    </div>
  );
}
