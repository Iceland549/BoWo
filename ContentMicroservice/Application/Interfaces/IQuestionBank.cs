using ContentMicroservice.Application.Questions;

namespace ContentMicroservice.Application.Interfaces
{
    /// <summary>
    /// Accès en mémoire aux questions de progression (160 questions).
    /// </summary>
    public interface IQuestionBank
    {
        /// <summary>
        /// Retourne l'ensemble des questions pour un trick donné.
        /// Lance une exception si le trick n'existe pas dans la banque.
        /// </summary>
        TrickQuestionSet GetQuestionsForTrick(string trickId);
    }

}
