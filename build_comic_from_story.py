#!/usr/bin/env python3
"""
AI Task Escrow Router - Comic Generator from Story
Integrates with the escrow system to create AI-generated comics from story prompts.
"""

import os
import json
import requests
from typing import Dict, List, Optional, Any
from dataclasses import dataclass
from enum import Enum

class ComicStyle(Enum):
    """Different comic generation styles"""
    MANGA = "manga"
    WESTERN = "western"
    CHIBI = "chibi"
    REALISTIC = "realistic"
    CARTOON = "cartoon"

class PanelLayout(Enum):
    """Panel layout options"""
    STRIP = "strip"          # 3-4 panels horizontal
    GRID = "grid"            # 2x2 or 3x3 grid
    SINGLE = "single"          # Single large panel
    SEQUENTIAL = "sequential"   # Vertical sequence

@dataclass
class ComicPanel:
    """Represents a single comic panel"""
    panel_id: int
    description: str
    style: ComicStyle
    layout: PanelLayout
    characters: List[str]
    background: str
    dialogue: Optional[str] = None
    sound_effects: Optional[str] = None

@dataclass
class ComicStory:
    """Story structure for comic generation"""
    title: str
    genre: str
    theme: str
    characters: List[str]
    setting: str
    plot_summary: str
    panels: List[ComicPanel]
    style: ComicStyle
    target_audience: str = "general"

class ComicGeneratorError(Exception):
    """Custom exception for comic generation errors"""
    pass

class AIEscrowIntegration:
    """Integration with AI Task Escrow Router"""
    
    def __init__(self, escrow_api_url: str, api_key: Optional[str] = None):
        self.escrow_api_url = escrow_api_url.rstrip('/')
        self.api_key = api_key
        self.session = requests.Session()
        
        if api_key:
            self.session.headers.update({
                'Authorization': f'Bearer {api_key}',
                'Content-Type': 'application/json'
            })
    
    def create_comic_task(self, story: ComicStory, priority: bool = False) -> Dict[str, Any]:
        """Create a comic generation task in the escrow system"""
        
        task_data = {
            "metadataUri": f"ipfs://comic-{story.title.lower().replace(' ', '-')}",
            "paymentToken": "EGLD",
            "paymentAmount": "1000000000000000000",  # 1 EGLD
            "deadline": int(time.time()) + 86400,  # 24 hours
            "reviewTimeout": 3600,  # 1 hour review
            "priority": priority,
            "taskType": "comic_generation",
            "storyData": {
                "title": story.title,
                "genre": story.genre,
                "theme": story.theme,
                "characters": story.characters,
                "setting": story.setting,
                "plot": story.plot_summary,
                "style": story.style.value,
                "target_audience": story.target_audience,
                "panel_count": len(story.panels)
            }
        }
        
        try:
            response = self.session.post(
                f"{self.escrow_api_url}/tasks",
                json=task_data
            )
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            raise ComicGeneratorError(f"Failed to create escrow task: {e}")
    
    def get_task_status(self, task_id: str) -> Dict[str, Any]:
        """Check the status of a comic generation task"""
        try:
            response = self.session.get(
                f"{self.escrow_api_url}/tasks/{task_id}"
            )
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            raise ComicGeneratorError(f"Failed to get task status: {e}")

class AIComicGenerator:
    """Main comic generation class"""
    
    def __init__(self, ai_service_url: str, escrow_integration: AIEscrowIntegration):
        self.ai_service_url = ai_service_url.rstrip('/')
        self.escrow = escrow_integration
        self.session = requests.Session()
    
    def generate_panel_description(self, panel: ComicPanel, context: str = "") -> str:
        """Generate detailed description for a comic panel"""
        
        prompt = f"""
        Generate a detailed comic panel description based on:
        
        Panel: {panel.panel_id}
        Description: {panel.description}
        Style: {panel.style.value}
        Characters: {', '.join(panel.characters)}
        Background: {panel.background}
        Dialogue: {panel.dialogue or 'None'}
        Sound Effects: {panel.sound_effects or 'None'}
        
        Previous context: {context}
        
        Provide a vivid, detailed description suitable for AI image generation.
        Include composition, lighting, mood, and specific visual elements.
        """
        
        try:
            response = self.session.post(
                f"{self.ai_service_url}/generate/description",
                json={"prompt": prompt, "style": panel.style.value}
            )
            response.raise_for_status()
            return response.json().get("description", "")
        except requests.exceptions.RequestException as e:
            raise ComicGeneratorError(f"Failed to generate panel description: {e}")
    
    def generate_panel_image(self, description: str, style: ComicStyle) -> str:
        """Generate image for a comic panel"""
        
        try:
            response = self.session.post(
                f"{self.ai_service_url}/generate/image",
                json={
                    "description": description,
                    "style": style.value,
                    "format": "comic_panel"
                }
            )
            response.raise_for_status()
            return response.json().get("image_url", "")
        except requests.exceptions.RequestException as e:
            raise ComicGeneratorError(f"Failed to generate panel image: {e}")
    
    def build_comic_from_story(self, story: ComicStory, auto_submit: bool = True) -> Dict[str, Any]:
        """
        Main function to build a complete comic from a story
        
        Args:
            story: ComicStory object containing the narrative and panel descriptions
            auto_submit: Whether to automatically submit to escrow system
            
        Returns:
            Dictionary containing comic data and escrow task information
        """
        
        print(f"🎨 Building comic: {story.title}")
        print(f"📖 Style: {story.style.value}")
        print(f"🎭 Characters: {', '.join(story.characters)}")
        print(f"📚 Panels: {len(story.panels)}")
        
        comic_panels = []
        context = ""
        
        # Generate each panel
        for i, panel in enumerate(story.panels):
            print(f"🖼️  Generating panel {i+1}/{len(story.panels)}...")
            
            # Generate enhanced description
            enhanced_description = self.generate_panel_description(panel, context)
            
            # Generate panel image
            image_url = self.generate_panel_image(enhanced_description, panel.style)
            
            comic_panel = {
                "panel_id": panel.panel_id,
                "original_description": panel.description,
                "enhanced_description": enhanced_description,
                "image_url": image_url,
                "style": panel.style.value,
                "characters": panel.characters,
                "background": panel.background,
                "dialogue": panel.dialogue,
                "sound_effects": panel.sound_effects
            }
            
            comic_panels.append(comic_panel)
            
            # Update context for next panel
            context = f"Panel {i+1}: {enhanced_description}"
        
        # Create comic metadata
        comic_metadata = {
            "title": story.title,
            "genre": story.genre,
            "theme": story.theme,
            "style": story.style.value,
            "characters": story.characters,
            "setting": story.setting,
            "plot_summary": story.plot_summary,
            "target_audience": story.target_audience,
            "panel_count": len(story.panels),
            "created_at": int(time.time()),
            "panels": comic_panels
        }
        
        result = {
            "comic": comic_metadata,
            "status": "completed",
            "panel_count": len(comic_panels)
        }
        
        # Submit to escrow system if requested
        if auto_submit:
            print("📋 Submitting to AI Task Escrow Router...")
            try:
                escrow_task = self.escrow.create_comic_task(story)
                result["escrow_task"] = escrow_task
                result["escrow_task_id"] = escrow_task.get("taskId")
                print(f"✅ Task created! ID: {result['escrow_task_id']}")
            except ComicGeneratorError as e:
                print(f"❌ Failed to create escrow task: {e}")
                result["escrow_error"] = str(e)
        
        return result

def create_sample_story() -> ComicStory:
    """Create a sample comic story for testing"""
    
    panels = [
        ComicPanel(
            panel_id=1,
            description="A young programmer discovers a mysterious glowing terminal in their dark room",
            style=ComicStyle.CARTOON,
            layout=PanelLayout.SINGLE,
            characters=["Alex"],
            background="Dark room with computer screens",
            dialogue="What is this...?",
            sound_effects="hummm..."
        ),
        ComicPanel(
            panel_id=2,
            description="The terminal displays a welcome message from the AI Task Escrow Router",
            style=ComicStyle.CARTOON,
            layout=PanelLayout.SINGLE,
            characters=["Alex"],
            background="Close-up on glowing terminal screen",
            dialogue="Welcome to the future of task automation!",
            sound_effects="beep!"
        ),
        ComicPanel(
            panel_id=3,
            description="Alex smiles while reviewing the escrow interface on multiple screens",
            style=ComicStyle.CARTOON,
            layout=PanelLayout.GRID,
            characters=["Alex"],
            background="Modern office with multiple monitors",
            dialogue="This is going to change everything!",
            sound_effects=None
        )
    ]
    
    return ComicStory(
        title="The Discovery",
        genre="Technology",
        theme="Innovation",
        characters=["Alex"],
        setting="Modern tech office",
        plot_summary="A developer discovers the AI Task Escrow Router and sees the potential for automated task management",
        panels=panels,
        style=ComicStyle.CARTOON,
        target_audience="developers"
    )

def main():
    """Main function demonstrating the comic builder"""
    
    # Configuration
    AI_SERVICE_URL = os.getenv("AI_SERVICE_URL", "http://localhost:8080")
    ESCROW_API_URL = os.getenv("ESCROW_API_URL", "http://localhost:3001")
    API_KEY = os.getenv("API_KEY")
    
    # Initialize integrations
    escrow = AIEscrowIntegration(ESCROW_API_URL, API_KEY)
    generator = AIComicGenerator(AI_SERVICE_URL, escrow)
    
    # Create sample story
    story = create_sample_story()
    
    try:
        # Build comic from story
        result = generator.build_comic_from_story(story, auto_submit=True)
        
        print("\n🎉 Comic generation completed!")
        print(f"📊 Generated {result['panel_count']} panels")
        print(f"🎨 Style: {result['comic']['style']}")
        
        if 'escrow_task_id' in result:
            print(f"📋 Escrow Task ID: {result['escrow_task_id']}")
            print("💰 Task submitted for agent completion")
        
        # Save result
        output_file = f"comic_{story.title.lower().replace(' ', '_')}.json"
        with open(output_file, 'w') as f:
            json.dump(result, f, indent=2)
        
        print(f"💾 Saved to: {output_file}")
        
    except ComicGeneratorError as e:
        print(f"❌ Error: {e}")
        return 1
    
    return 0

if __name__ == "__main__":
    import time
    main()
