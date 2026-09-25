export interface IProjectValidation {
    problemSolved: string
    scores: Scores
    description: Description
    competitorAnalysis: CompetitorAnalysi[]
}

export interface Scores {
    marketDemand: MarketDemand
    feasibility: Feasibility
    scalability: Scalability
    revenuePotential: RevenuePotential
    risk: Risk
}

export interface MarketDemand {
    value: number
    feedback: string
}

export interface Feasibility {
    value: number
    feedback: string
}

export interface Scalability {
    value: number
    feedback: string
}

export interface RevenuePotential {
    value: number
    feedback: string
}

export interface Risk {
    value: number
    feedback: string
}

export interface Description {
    shortDescription: string
    longDescription: string
    logoDescription: string
}

export interface CompetitorAnalysi {
    name: string
    url: string
    overview: string
    strengths: string
    weaknesses: string
}
