using ContentMicroservice.Application.Interfaces;
using ContentMicroservice.Application.Questions;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.Json;

namespace ContentMicroservice.Infrastructure.QuestionBank
{
    public class QuestionBankOptions
    {
        /// <summary>
        /// Chemin vers le fichier questions.json (relatif à la racine de l'application).
        /// </summary>
        public string JsonPath { get; set; } = "Data/questions.json";
    }

    public class QuestionBankService : IQuestionBank
    {
        private readonly ILogger<QuestionBankService> _logger;
        private readonly Dictionary<string, TrickQuestionSet> _bank;

        public QuestionBankService(
            ILogger<QuestionBankService> logger,
            IOptions<QuestionBankOptions> options)
        {
            _logger = logger;
            _bank = LoadBank(options.Value.JsonPath);
        }

        private Dictionary<string, TrickQuestionSet> LoadBank(string path)
        {
            try
            {
                if (!File.Exists(path))
                {
                    throw new FileNotFoundException($"QuestionBank JSON not found at path: {path}");
                }

                var json = File.ReadAllText(path);
                var sets = JsonSerializer.Deserialize<List<TrickQuestionSet>>(json, new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                }) ?? new List<TrickQuestionSet>();

                return sets.ToDictionary(
                    x => x.Trick,
                    x => x,
                    StringComparer.OrdinalIgnoreCase
                );
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[QuestionBank] Failed to load questions from {Path}", path);
                throw;
            }
        }

        public TrickQuestionSet GetQuestionsForTrick(string trickId)
        {
            if (_bank.TryGetValue(trickId, out var set))
            {
                return set;
            }

            throw new KeyNotFoundException($"No questions defined for trick '{trickId}'.");
        }
    }
}
