import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { v4 as uuidv4 } from "uuid";

export default function SurveyForm({ surveyName }) {
  const [questions, setQuestions] = useState([]);
  const [responses, setResponses] = useState({});
  const [userEmail, setUserEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const { data: userData } = await supabase.auth.getUser();
      setUserEmail(userData?.user?.email || "");

      const { data, error } = await supabase
        .from("survey_config")
        .select("config")
        .eq("survey_name", surveyName)
        .single();

      if (data?.config?.questions) {
        setQuestions(data.config.questions);
      } else {
        console.error("Failed to load survey config:", error);
      }

      setLoading(false);
    };

    fetchData();
  }, [surveyName]);

  const handleOptionSelect = (questionId, selectedOption) => {
    setResponses((prev) => ({
      ...prev,
      [questionId]: selectedOption,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { error } = await supabase.from("survey_responses").insert([
      {
        email: userEmail,
        survey_type: surveyName,
        submission_id: uuidv4(),
        responses,
        submitted_at: new Date().toISOString(),
      },
    ]);

    if (!error) {
      setSubmitted(true);
    } else {
      console.error("Submission error:", error);
    }
  };

  if (loading) {
    return <div className="p-6 text-center">Loading survey...</div>;
  }

  if (submitted) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-2xl font-semibold mb-4">Thank you!</h2>
        <p>Your responses have been recorded.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto p-6 space-y-10">
      {questions.map((question, index) => (
        <div key={question.id} className="space-y-4">
          <h3 className="text-lg font-medium">
            {index + 1}. {question.text}
          </h3>

          {question.type === "multiple_choice" && (
            <div className="space-y-2">
              {question.options.map((option) => (
                <label
                  key={option}
                  className="flex items-center space-x-2 cursor-pointer"
                >
                  <input
                    type="radio"
                    name={question.id}
                    value={option}
                    checked={responses[question.id] === option}
                    onChange={() => handleOptionSelect(question.id, option)}
                    className="form-radio text-blue-600"
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>
          )}

          {question.type === "image_choice" && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {question.options.map((option) => (
                <label
                  key={option.label}
                  className={`border-2 rounded-lg p-2 cursor-pointer transition ${
                    responses[question.id] === option.label
                      ? "border-blue-600"
                      : "border-transparent"
                  }`}
                >
                  <input
                    type="radio"
                    name={question.id}
                    value={option.label}
                    className="hidden"
                    onChange={() =>
                      handleOptionSelect(question.id, option.label)
                    }
                  />
                  <img
                    src={option.image_url}
                    alt={option.label}
                    className="w-full h-32 object-cover rounded"
                  />
                  <p className="text-center mt-2 text-sm">{option.label}</p>
                </label>
              ))}
            </div>
          )}
        </div>
      ))}

      <div className="text-center">
        <button
          type="submit"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Submit Survey
        </button>
      </div>
    </form>
  );
}
