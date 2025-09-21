import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft, BookOpen, Play, Headphones, FileText, Search, Clock, Star } from "lucide-react";

interface ResourceHubProps {
  onBack: () => void;
  initialFilter?: string;
}

const RESOURCES = [
  {
    id: '1',
    type: 'video',
    title: '5-Minute Mindfulness Meditation',
    description: 'A gentle guided meditation to help you find calm and center yourself.',
    duration: '5 min',
    rating: 4.8,
    thumbnail: 'https://img.youtube.com/vi/ZToicYcHIOU/maxresdefault.jpg',
    url: 'https://youtube.com/watch?v=ZToicYcHIOU',
    category: 'mindfulness'
  },
  {
    id: '2',
    type: 'video',
    title: 'Breathing Exercises for Anxiety',
    description: 'Learn effective breathing techniques to manage anxiety and stress.',
    duration: '8 min',
    rating: 4.9,
    thumbnail: 'https://img.youtube.com/vi/tybOi4hjZFQ/maxresdefault.jpg',
    url: 'https://youtube.com/watch?v=tybOi4hjZFQ',
    category: 'anxiety'
  },
  {
    id: '3',
    type: 'article',
    title: 'Managing Academic Stress',
    description: 'Practical strategies for handling college workload and academic pressure.',
    readTime: '7 min read',
    rating: 4.7,
    category: 'academic'
  },
  {
    id: '4',
    type: 'audio',
    title: 'Sleep Meditation for Students',
    description: 'Relaxing audio to help you unwind and get better sleep.',
    duration: '15 min',
    rating: 4.6,
    category: 'sleep'
  },
  {
    id: '5',
    type: 'video',
    title: 'Progressive Muscle Relaxation',
    description: 'Learn to release physical tension and stress from your body.',
    duration: '12 min',
    rating: 4.8,
    thumbnail: 'https://img.youtube.com/vi/1nZEdqcGVzo/maxresdefault.jpg',
    url: 'https://youtube.com/watch?v=1nZEdqcGVzo',
    category: 'relaxation'
  },
  {
    id: '6',
    type: 'article',
    title: 'Building Resilience in College',
    description: 'How to develop mental resilience and bounce back from challenges.',
    readTime: '10 min read',
    rating: 4.5,
    category: 'resilience'
  }
];

const CATEGORIES = [
  { id: 'all', label: 'All Resources' },
  { id: 'mindfulness', label: 'Mindfulness' },
  { id: 'anxiety', label: 'Anxiety Support' },
  { id: 'academic', label: 'Academic Stress' },
  { id: 'sleep', label: 'Sleep & Rest' },
  { id: 'relaxation', label: 'Relaxation' },
  { id: 'resilience', label: 'Resilience' }
];

const getResourceIcon = (type: string) => {
  switch (type) {
    case 'video': return Play;
    case 'audio': return Headphones;
    case 'article': return FileText;
    default: return BookOpen;
  }
};

const getResourceMeta = (resource: any) => {
  if (resource.type === 'video' || resource.type === 'audio') {
    return { icon: Clock, text: resource.duration };
  }
  return { icon: Clock, text: resource.readTime };
};

export const ResourceHub = ({ onBack, initialFilter = 'all' }: ResourceHubProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(initialFilter);

  const filteredResources = RESOURCES.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         resource.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || resource.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleResourceClick = (resource: any) => {
    if (resource.url) {
      window.open(resource.url, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">Resource Hub</h1>
            <p className="text-muted-foreground">Curated wellness resources to support your mental health journey</p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search resources..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(category => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
                className="rounded-full"
              >
                {category.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Resources Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResources.map(resource => {
            const ResourceIcon = getResourceIcon(resource.type);
            const meta = getResourceMeta(resource);
            const MetaIcon = meta.icon;

            return (
              <Card
                key={resource.id}
                className="wellness-card cursor-pointer group"
                onClick={() => handleResourceClick(resource)}
              >
                {/* Thumbnail for videos */}
                {resource.thumbnail && (
                  <div className="relative mb-4 rounded-lg overflow-hidden">
                    <img
                      src={resource.thumbnail}
                      alt={resource.title}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                    <div className="absolute top-4 left-4">
                      <div className="p-2 bg-black/50 rounded-full">
                        <ResourceIcon className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  </div>
                )}

                {/* Content */}
                <div className={resource.thumbnail ? '' : 'pt-4'}>
                  {!resource.thumbnail && (
                    <div className="p-3 bg-primary/10 rounded-xl w-fit mb-4">
                      <ResourceIcon className="w-6 h-6 text-primary" />
                    </div>
                  )}

                  <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                    {resource.title}
                  </h3>

                  <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
                    {resource.description}
                  </p>

                  {/* Metadata */}
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <MetaIcon className="w-3 h-3" />
                      <span>{meta.text}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      <span>{resource.rating}</span>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredResources.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No resources found</h3>
            <p className="text-muted-foreground">Try adjusting your search or category filter.</p>
          </div>
        )}

        {/* Help Section */}
        <Card className="mt-12 p-6 bg-primary/5 border-primary/20">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Need More Support?
            </h3>
            <p className="text-muted-foreground mb-4">
              If these resources aren't enough, consider connecting with peer support or booking a counselor appointment.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button variant="support">
                Join Peer Support
              </Button>
              <Button variant="outline">
                Book Counselor
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};