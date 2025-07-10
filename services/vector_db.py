import logging
import os
from typing import List, Dict, Any, Optional
import chromadb
from chromadb.config import Settings
import json

# Try to import sentence transformers, use fallback if not available
try:
    from sentence_transformers import SentenceTransformer
    HAS_SENTENCE_TRANSFORMERS = True
except ImportError:
    HAS_SENTENCE_TRANSFORMERS = False

class VectorDatabase:
    """Vector database service for RAG capabilities"""
    
    def __init__(self):
        self.logger = logging.getLogger("vector_db")
        
        # Initialize ChromaDB
        self.client = chromadb.Client(Settings(
            anonymized_telemetry=False,
            is_persistent=True,
            persist_directory="./chroma_db"
        ))
        
        # Initialize sentence transformer for embeddings
        if HAS_SENTENCE_TRANSFORMERS:
            self.encoder = SentenceTransformer('all-MiniLM-L6-v2')
        else:
            self.encoder = None
            self.logger.warning("Sentence transformers not available, using basic text matching")
        
        # Initialize collections
        self.chemvio_collection = self._get_or_create_collection('chemvio_knowledge')
        self.tactical_collection = self._get_or_create_collection('tactical_procedures')
        self.hazmat_collection = self._get_or_create_collection('hazmat_database')
        
        # Initialize knowledge base
        self._initialize_knowledge_base()
        
    def _get_or_create_collection(self, name: str):
        """Get or create a ChromaDB collection"""
        try:
            return self.client.get_collection(name)
        except Exception:
            return self.client.create_collection(name)
            
    def _initialize_knowledge_base(self):
        """Initialize the knowledge base with essential ChemBio information"""
        # Check if knowledge base is already initialized
        if self.chemvio_collection.count() > 0:
            self.logger.info("Knowledge base already initialized")
            return
            
        self.logger.info("Initializing ChemBio knowledge base")
        
        # Chemical hazards knowledge
        chemical_knowledge = [
            {
                "id": "chem_001",
                "title": "Chemical Weapon Agents Classification",
                "content": "Chemical warfare agents are classified into several categories: Nerve agents (GA, GB, GD, GF, VX), Blister agents (HD, HN, L), Blood agents (AC, CK), Choking agents (CG, DP), and Incapacitating agents (BZ). Each category has specific detection methods, symptoms, and treatment protocols.",
                "category": "chemical_hazards",
                "tags": ["chemical weapons", "classification", "detection"],
                "source": "NATO STANAG 4150"
            },
            {
                "id": "chem_002",
                "title": "Illicit Drug Precursors",
                "content": "Common precursors for methamphetamine synthesis include pseudoephedrine, ephedrine, red phosphorus, iodine, and anhydrous ammonia. MDMA precursors include safrole, isosafrole, and 3,4-methylenedioxyphenyl-2-propanone (MDP2P). Cocaine processing uses sulfuric acid, hydrochloric acid, and various organic solvents.",
                "category": "drug_precursors",
                "tags": ["precursors", "methamphetamine", "MDMA", "cocaine"],
                "source": "DEA Controlled Substances"
            },
            {
                "id": "chem_003",
                "title": "Chemical Synthesis Detection",
                "content": "Indicators of chemical synthesis operations include: unusual odors (ethereal, ammonia, vinegar), laboratory glassware, heating equipment, chemical storage containers, improper ventilation, chemical waste, and protective equipment. Multi-step synthesis operations typically involve distillation, crystallization, and purification processes.",
                "category": "synthesis_detection",
                "tags": ["synthesis", "detection", "indicators"],
                "source": "FBI Hazardous Materials Response"
            }
        ]
        
        # Biological hazards knowledge
        biological_knowledge = [
            {
                "id": "bio_001",
                "title": "Biological Weapon Agents",
                "content": "Category A biological agents include: Bacillus anthracis (anthrax), Clostridium botulinum (botulism), Francisella tularensis (tularemia), Variola major (smallpox), Viral hemorrhagic fevers (Ebola, Marburg, Lassa, Machupo), and Yersinia pestis (plague). These agents pose the highest risk to national security.",
                "category": "biological_hazards",
                "tags": ["biological weapons", "category A", "bioterrorism"],
                "source": "CDC Bioterrorism Agents"
            },
            {
                "id": "bio_002",
                "title": "Laboratory Biosafety Levels",
                "content": "BSL-1: Basic teaching labs, non-pathogenic E. coli. BSL-2: Primary barriers, restricted access, pathogenic microorganisms. BSL-3: Controlled access, specialized ventilation, aerosol containment. BSL-4: Maximum containment, positive pressure suits, dangerous pathogens.",
                "category": "biosafety",
                "tags": ["biosafety", "containment", "laboratory"],
                "source": "CDC/NIH Biosafety Guidelines"
            }
        ]
        
        # MOPP and protective equipment knowledge
        mopp_knowledge = [
            {
                "id": "mopp_001",
                "title": "MOPP Level Guidelines",
                "content": "MOPP 0: Carry protective mask. MOPP 1: Overgarment worn, mask carried. MOPP 2: Overgarment and overboots worn, mask carried. MOPP 3: Overgarment, overboots, and gloves worn, mask carried. MOPP 4: All protective equipment worn including mask. Duration limitations apply at higher levels.",
                "category": "protective_equipment",
                "tags": ["MOPP", "protective equipment", "chemical protection"],
                "source": "US Army CBRN Guidelines"
            },
            {
                "id": "mopp_002",
                "title": "Chemical Detection Equipment",
                "content": "M8 Chemical Detection Paper: Detects liquid chemical agents. M9 Chemical Detection Paper: Detects nerve and blister agents. M256A1 Chemical Detection Kit: Detects vapor concentrations. Joint Chemical Agent Detector (JCAD): Real-time detection and identification.",
                "category": "detection_equipment",
                "tags": ["detection", "chemical agents", "equipment"],
                "source": "CBRN Equipment Manual"
            }
        ]
        
        # Tactical procedures knowledge
        tactical_knowledge = [
            {
                "id": "tac_001",
                "title": "Clandestine Laboratory Assessment",
                "content": "Initial assessment protocol: Establish security perimeter, identify potential hazards, document scene with photography, assess ventilation and containment, identify escape routes, coordinate with specialized teams. Do not disturb chemical processes or equipment until hazards are assessed.",
                "category": "tactical_procedures",
                "tags": ["clandestine lab", "assessment", "procedures"],
                "source": "DEA Clandestine Laboratory Manual"
            },
            {
                "id": "tac_002",
                "title": "Evidence Collection Procedures",
                "content": "Chain of custody must be maintained. Photograph all evidence in original location. Use appropriate containers for different sample types. Label all samples with date, time, location, and collector information. Maintain samples at appropriate temperature and conditions.",
                "category": "evidence_collection",
                "tags": ["evidence", "chain of custody", "procedures"],
                "source": "FBI Evidence Collection Guidelines"
            }
        ]
        
        # Add all knowledge to the database
        all_knowledge = chemical_knowledge + biological_knowledge + mopp_knowledge + tactical_knowledge
        
        for knowledge in all_knowledge:
            self.add_knowledge(knowledge)
            
        self.logger.info(f"Initialized knowledge base with {len(all_knowledge)} entries")
        
    def add_knowledge(self, knowledge: Dict[str, Any]) -> bool:
        """Add knowledge entry to the vector database"""
        try:
            # Create embedding
            if self.encoder:
                embedding = self.encoder.encode(knowledge['content']).tolist()
            else:
                # Use basic text hash as fallback
                embedding = [hash(knowledge['content']) % 1000 / 1000.0] * 384
            
            # Add to appropriate collection
            if knowledge['category'] in ['chemical_hazards', 'drug_precursors', 'synthesis_detection']:
                collection = self.chemvio_collection
            elif knowledge['category'] in ['tactical_procedures', 'evidence_collection']:
                collection = self.tactical_collection
            elif knowledge['category'] in ['protective_equipment', 'detection_equipment', 'biosafety']:
                collection = self.hazmat_collection
            else:
                collection = self.chemvio_collection  # Default
                
            # Add to collection
            collection.add(
                ids=[knowledge['id']],
                embeddings=[embedding],
                metadatas=[{
                    'title': knowledge['title'],
                    'category': knowledge['category'],
                    'tags': json.dumps(knowledge['tags']),
                    'source': knowledge['source']
                }],
                documents=[knowledge['content']]
            )
            
            return True
            
        except Exception as e:
            self.logger.error(f"Error adding knowledge: {str(e)}")
            return False
            
    def search_knowledge(self, query: str, category: Optional[str] = None, 
                        limit: int = 5) -> List[Dict[str, Any]]:
        """Search for relevant knowledge based on query"""
        try:
            # Create query embedding
            if self.encoder:
                query_embedding = self.encoder.encode(query).tolist()
            else:
                # Use basic text hash as fallback
                query_embedding = [hash(query) % 1000 / 1000.0] * 384
            
            # Determine which collections to search
            collections = []
            if category:
                if category in ['chemical_hazards', 'drug_precursors', 'synthesis_detection']:
                    collections = [self.chemvio_collection]
                elif category in ['tactical_procedures', 'evidence_collection']:
                    collections = [self.tactical_collection]
                elif category in ['protective_equipment', 'detection_equipment', 'biosafety']:
                    collections = [self.hazmat_collection]
                else:
                    collections = [self.chemvio_collection, self.tactical_collection, self.hazmat_collection]
            else:
                collections = [self.chemvio_collection, self.tactical_collection, self.hazmat_collection]
                
            # Search collections
            all_results = []
            for collection in collections:
                results = collection.query(
                    query_embeddings=[query_embedding],
                    n_results=limit
                )
                
                if results['documents'] and results['documents'][0]:
                    for i, doc in enumerate(results['documents'][0]):
                        all_results.append({
                            'content': doc,
                            'metadata': results['metadatas'][0][i],
                            'distance': results['distances'][0][i],
                            'id': results['ids'][0][i]
                        })
                        
            # Sort by distance (similarity) and return top results
            all_results.sort(key=lambda x: x['distance'])
            return all_results[:limit]
            
        except Exception as e:
            self.logger.error(f"Error searching knowledge: {str(e)}")
            return []
            
    def get_contextual_knowledge(self, findings: List[str], 
                               agent_type: str = 'general') -> List[Dict[str, Any]]:
        """Get contextual knowledge based on agent findings"""
        context_knowledge = []
        
        for finding in findings:
            # Search for relevant knowledge
            results = self.search_knowledge(finding, limit=2)
            context_knowledge.extend(results)
            
        # Remove duplicates
        unique_knowledge = []
        seen_ids = set()
        for knowledge in context_knowledge:
            if knowledge['id'] not in seen_ids:
                unique_knowledge.append(knowledge)
                seen_ids.add(knowledge['id'])
                
        return unique_knowledge[:10]  # Limit to top 10 results
        
    def get_agent_specific_knowledge(self, agent_name: str, 
                                   context: str) -> List[Dict[str, Any]]:
        """Get knowledge specific to an agent's domain"""
        agent_queries = {
            'hazard_detector': [
                'chemical hazards detection',
                'biological hazards identification',
                'toxic exposure symptoms',
                'contamination assessment'
            ],
            'synthesis_analyzer': [
                'chemical synthesis processes',
                'drug precursor identification',
                'clandestine laboratory indicators',
                'illicit manufacturing methods'
            ],
            'mopp_recommender': [
                'protective equipment guidelines',
                'MOPP level recommendations',
                'chemical exposure protection',
                'decontamination procedures'
            ],
            'sampling_strategist': [
                'evidence collection procedures',
                'sampling protocols',
                'chain of custody requirements',
                'analytical methods'
            ]
        }
        
        queries = agent_queries.get(agent_name, ['general knowledge'])
        
        # Add context to queries
        if context:
            queries.append(context)
            
        all_knowledge = []
        for query in queries:
            results = self.search_knowledge(query, limit=3)
            all_knowledge.extend(results)
            
        # Remove duplicates and return
        unique_knowledge = []
        seen_ids = set()
        for knowledge in all_knowledge:
            if knowledge['id'] not in seen_ids:
                unique_knowledge.append(knowledge)
                seen_ids.add(knowledge['id'])
                
        return unique_knowledge[:8]  # Limit to top 8 results
        
    def get_collection_stats(self) -> Dict[str, Any]:
        """Get statistics about the knowledge collections"""
        return {
            'chemvio_collection_count': self.chemvio_collection.count(),
            'tactical_collection_count': self.tactical_collection.count(),
            'hazmat_collection_count': self.hazmat_collection.count(),
            'total_knowledge_entries': (
                self.chemvio_collection.count() + 
                self.tactical_collection.count() + 
                self.hazmat_collection.count()
            )
        }
