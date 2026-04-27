
export const lookupTable: Array<[string, string]> = [
    // 0-8: proofs-in-analysis
    ["proofs-in-analysis", "what-is-a-proof"],
    ["proofs-in-analysis", "the-general-structure-prove-statements-block-by-block"],
    ["proofs-in-analysis", "proving-and-using-for-all-and-there-exists-statements"],
    ["proofs-in-analysis", "trying-to-finish-the-proof"],
    ["proofs-in-analysis", "help-in-making-choices"],
    ["proofs-in-analysis", "let-s-try-again"],
    ["proofs-in-analysis", "natural-induction"],
    ["proofs-in-analysis", "negations-and-quantifiers"],
    ["proofs-in-analysis", "proofs-by-contradiction"],

    // 9-14: sets-spaces-and-functions
    ["sets-spaces-and-functions", "what-analysis-is-about"],
    ["sets-spaces-and-functions", "functions-between-sets"],
    ["sets-spaces-and-functions", "set-theoretic-definition-of-functions"],
    ["sets-spaces-and-functions", "metric-spaces"],
    ["sets-spaces-and-functions", "normed-vector-spaces"],
    ["sets-spaces-and-functions", "the-reverse-triangle-inequality"],

    // 15-22: real-numbers
    ["real-numbers", "what-are-the-real-numbers"],
    ["real-numbers", "the-completeness-axiom"],
    ["real-numbers", "alternative-characterizations-of-suprema-and-infima"],
    ["real-numbers", "maxima-and-minima"],
    ["real-numbers", "the-archimedean-property"],
    ["real-numbers", "sets-can-be-complicated"],
    ["real-numbers", "computation-rules-for-suprema"],
    ["real-numbers", "bernoulli-s-inequality"],

    // 23-30: sequences
    ["sequences", "a-sequence-is-a-function-from-the-natural-numbers"],
    ["sequences", "terminology-around-sequences"],
    ["sequences", "convergence-of-sequences"],
    ["sequences", "examples-and-limits-of-simple-sequences"],
    ["sequences", "uniqueness-of-limits"],
    ["sequences", "more-properties-of-convergent-sequences"],
    ["sequences", "limit-theorems-for-sequences-taking-values-in-a-normed-vector-space"],
    ["sequences", "index-shift"],

    // 31-36: real-valued-sequences
    ["real-valued-sequences", "terminology"],
    ["real-valued-sequences", "monotone-bounded-sequences-are-convergent"],
    ["real-valued-sequences", "limit-theorems"],
    ["real-valued-sequences", "the-squeeze-theorem"],
    ["real-valued-sequences", "divergence-to-texorpdfstring-infty"],
    ["real-valued-sequences", "limit-theorems-for-improper-limits"],

    // 37-43: series
    ["series", "definitions"],
    ["series", "geometric-series"],
    ["series", "the-harmonic-series"],
    ["series", "the-hyperharmonic-series"],
    ["series", "only-the-tail-matters-for-convergence"],
    ["series", "divergence-test"],
    ["series", "limit-laws-for-series"],

    // 44-47: series-with-positive-terms
    ["series-with-positive-terms", "comparison-test"],
    ["series-with-positive-terms", "limit-comparison-test"],
    ["series-with-positive-terms", "ratio-test"],
    ["series-with-positive-terms", "root-test"],

    // 48-50: series-with-general-terms
    ["series-with-general-terms", "series-with-real-terms-the-leibniz-test"],
    ["series-with-general-terms", "series-characterization-of-completeness-in-normed-vector-spaces"],
    ["series-with-general-terms", "the-cauchy-product"],

    // 51-56: subsequences-lim-sup-and-lim-inf
    ["subsequences-lim-sup-and-lim-inf", "index-sequences-and-subsequences"],
    ["subsequences-lim-sup-and-lim-inf", "sequential-accumulation-points"],
    ["subsequences-lim-sup-and-lim-inf", "subsequences-of-a-converging-sequence"],
    ["subsequences-lim-sup-and-lim-inf", "lim-sup"],
    ["subsequences-lim-sup-and-lim-inf", "lim-inf"],
    ["subsequences-lim-sup-and-lim-inf", "relations-between-lim-lim-inf-and-lim-sup"],

    // 57-58: point-set-topology-of-metric-spaces
    ["point-set-topology-of-metric-spaces", "open-sets"],
    ["point-set-topology-of-metric-spaces", "closed-sets"],

    // 59-61: point-set-topology-of-metric-spaces
    ["point-set-topology-of-metric-spaces", "cauchy-sequences"],
    ["point-set-topology-of-metric-spaces", "completeness"],
    ["point-set-topology-of-metric-spaces", "series-characterization-of-completeness-in-normed-vector-spaces"],

    // 62-64: compactness
    ["compactness", "definition-of-sequential-compactness"],
    ["compactness", "boundedness-and-total-boundedness"],
    ["compactness", "alternative-characterization-of-compactness"],

    // 65-74: limits-and-continuity
    ["limits-and-continuity", "accumulation-points"],
    ["limits-and-continuity", "limit-in-an-accumulation-point"],
    ["limits-and-continuity", "uniqueness-of-limits"],
    ["limits-and-continuity", "sequence-characterization-of-limits"],
    ["limits-and-continuity", "limit-laws"],
    ["limits-and-continuity", "continuity"],
    ["limits-and-continuity", "sequence-characterization-of-continuity"],
    ["limits-and-continuity", "rules-for-continuous-functions"],
    ["limits-and-continuity", "images-of-compact-sets-under-continuous-functions-are-compact"],
    ["limits-and-continuity", "uniform-continuity"],

    // 75-85: real-valued-functions
    ["real-valued-functions", "more-limit-laws"],
    ["real-valued-functions", "building-new-continuous-functions"],
    ["real-valued-functions", "continuity-of-standard-functions"],
    ["real-valued-functions", "limits-from-the-left-and-from-the-right"],
    ["real-valued-functions", "the-extended-real-line"],
    ["real-valued-functions", "limits-to-texorpdfstring-infty"],
    ["real-valued-functions", "limits-at-texorpdfstring-infty"],
    ["real-valued-functions", "the-intermediate-value-theorem"],
    ["real-valued-functions", "the-extreme-value-theorem"],
    ["real-valued-functions", "equivalence-of-norms"],
    ["real-valued-functions", "bounded-linear-maps-and-operator-norms"],

    // 86-96: differentiability
    ["differentiability", "one-variable-derivative-prime-derivative"],
    ["differentiability", "differentiability-of-some-standard-functions"],
    ["differentiability", "components-and-the-one-variable-derivative"],
    ["differentiability", "preview-on-partial-derivatives"],
    ["differentiability", "directional-derivative"],
    ["differentiability", "partial-derivatives"],
    ["differentiability", "the-derivative-of-a-function"],
    ["differentiability", "relation-to-the-directional-derivative"],
    ["differentiability", "relation-to-the-one-variable-derivative"],
    ["differentiability", "the-derivative-as-a-function"],
    ["differentiability", "the-jacobian"],

    // 97-105: properties-of-derivatives
    ["properties-of-derivatives", "global-context"],
    ["properties-of-derivatives", "polynomials-and-rational-functions-are-differentiable"],
    ["properties-of-derivatives", "constant-and-linear-maps-are-differentiable"],
    ["properties-of-derivatives", "the-chain-rule"],
    ["properties-of-derivatives", "sum-product-and-quotient-rules"],
    ["properties-of-derivatives", "differentiability-of-components"],
    ["properties-of-derivatives", "differentiability-implies-continuity"],
    ["properties-of-derivatives", "derivative-vanishes-in-local-maxima-and-minima"],
    ["properties-of-derivatives", "the-mean-value-theorem"],

    // 106-107: linearization-tangent-planes-and-gradients
    ["linearization-tangent-planes-and-gradients", "linearization-and-tangent-planes"],
    ["linearization-tangent-planes-and-gradients", "the-gradient-of-a-function"],

    // 108-111: the-mean-value-inequality
    ["the-mean-value-inequality", "the-mean-value-inequality-for-functions-defined-on-an-interval"],
    ["the-mean-value-inequality", "the-mean-value-inequality-for-functions-on-general-domains"],
    ["the-mean-value-inequality", "the-intricate-relationship-between-derivatives-and-directional-derivatives"],
    ["the-mean-value-inequality", "continuous-partial-derivatives-implies-differentiability"],

    // 112-119: higher-order-derivatives
    ["higher-order-derivatives", "repeated-directional-derivatives"],
    ["higher-order-derivatives", "repeated-partial-derivatives"],
    ["higher-order-derivatives", "definition-of-higher-order-derivatives"],
    ["higher-order-derivatives", "relation-to-texorpdfstring-n"],
    ["higher-order-derivatives", "a-criterion-for-higher-differentiability"],
    ["higher-order-derivatives", "multi-linear-maps"],
    ["higher-order-derivatives", "symmetry-of-second-order-derivatives"],
    ["higher-order-derivatives", "symmetry-of-higher-order-derivatives"],

    // 120-122: polynomials-and-approximation-by-polynomials
    ["polynomials-and-approximation-by-polynomials", "taylor-s-theorem"],
    ["polynomials-and-approximation-by-polynomials", "homogeneous-polynomials"],
    ["polynomials-and-approximation-by-polynomials", "taylor-approximations-of-standard-functions"],

    // 123-124: banach-fixed-point-theorem
    ["banach-fixed-point-theorem", "the-banach-fixed-point-theorem"],
    ["banach-fixed-point-theorem", "an-example"],

    // 125-128: implicit-function-theorem
    ["implicit-function-theorem", "the-objective"],
    ["implicit-function-theorem", "notation"],
    ["implicit-function-theorem", "the-implicit-function-theorem"],
    ["implicit-function-theorem", "the-inverse-function-theorem"],

    // 129-136: function-sequences
    ["function-sequences", "pointwise-convergence"],
    ["function-sequences", "uniform-convergence"],
    ["function-sequences", "preservation-of-continuity-under-uniform-convergence"],
    ["function-sequences", "differentiability-theorem"],
    ["function-sequences", "the-normed-vector-space-of-bounded-functions"],
    ["function-series", "definitions"],
    ["function-series", "the-weierstrass-m-test"],
    ["function-series", "conditions-for-differentiation-of-function-series"],

    // 137-142: power-series
    ["power-series", "definition"],
    ["power-series", "convergence-of-power-series"],
    ["power-series", "standard-functions-defined-as-power-series"],
    ["power-series", "operations-with-power-series"],
    ["power-series", "differentiation-of-power-series"],
    ["power-series", "taylor-series"],

    // 143-155: riemann-integration-in-one-dimension
    ["riemann-integration-in-one-dimension", "riemann-integrable-functions-and-the-riemann-integral"],
    ["riemann-integration-in-one-dimension", "sums-products-of-riemann-integrable-functions"],
    ["riemann-integration-in-one-dimension", "continuous-functions-are-riemann-integrable"],
    ["riemann-integration-in-one-dimension", "fundamental-theorem-of-calculus"],
    ["riemann-integration-in-multiple-dimensions", "partitions-in-multiple-dimensions"],
    ["riemann-integration-in-multiple-dimensions", "riemann-integral-on-rectangles-in-texorpdfstring-mathbb-r"],
    ["riemann-integration-in-multiple-dimensions", "properties-of-the-multi-dimensional-riemann-integral"],
    ["riemann-integration-in-multiple-dimensions", "continuous-functions-are-riemann-integrable"],
    ["riemann-integration-in-multiple-dimensions", "fubini-s-theorem"],
    ["riemann-integration-in-multiple-dimensions", "the-topological-boundary-of-a-set"],
    ["riemann-integration-in-multiple-dimensions", "jordan-content"],
    ["riemann-integration-in-multiple-dimensions", "integration-over-general-domains"],
    ["riemann-integration-in-multiple-dimensions", "the-volume-of-bounded-sets"],

    // 156-159: change-of-variables-theorem
    ["change-of-variables-theorem", "the-change-of-variables-theorem"],
    ["change-of-variables-theorem", "polar-coordinates"],
    ["change-of-variables-theorem", "cylindrical-coordinates"],
    ["change-of-variables-theorem", "spherical-coordinates"],

    // 160-182: best-practices
    ["best-practices", "preparing-your-proof"],
    ["best-practices", "directly-proving-a-for-all-statement"],
    ["best-practices", "directly-proving-a-there-exists-statement"],
    ["best-practices", "emph-using"],
    ["best-practices", "use-the-implication-symbol-according-to-its-meaning"],
    ["best-practices", "square-summary-proving-and-using-forall-and-exists"],
    ["best-practices", "proving-an-implication"],
    ["best-practices", "chains-of-in-equalities"],
    ["best-practices", "backwards-reasoning"],
    ["best-practices", "forwards-reasoning"],
    ["best-practices", "checking-the-conditions-of-a-theorem-lemma-proposition"],
    ["best-practices", "proof-by-contradiction"],
    ["best-practices", "case-distinctions"],
    ["best-practices", "proof-by-induction"],
    ["best-practices", "inductive-definition"],
    ["best-practices", "showing-if-and-only-if-statements"],
    ["best-practices", "make-sure-variables-are-defined"],
    ["best-practices", "use-the-implication-symbol-according-to-its-meaning"],
    ["best-practices", "include-reminders-of-what-you-need-to-show"],
    ["best-practices", "include-reminders-of-what-you-have-just-shown"],
    ["best-practices", "be-clear-about-the-role-of-sentences-in-your-proof"],
    ["best-practices", "care-about-the-presentation-of-your-proof"],
    ["best-practices", "use-your-best-handwriting"],

    // 183: notations-for-derivatives
    ["notations-for-derivatives", "notations-for-derivatives"],
];
