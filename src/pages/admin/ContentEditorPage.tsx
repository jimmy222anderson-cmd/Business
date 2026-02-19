import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Save, Plus, Trash2, FileText, Shield } from 'lucide-react';
import { getPrivacyPolicy, getTermsOfService, updateContent, type ContentSection } from '@/lib/api/content';
import { toast } from 'sonner';
import { BackButton } from '@/components/BackButton';

interface EditableSection {
  id: string;
  title: string;
  content: string;
}

export default function ContentEditorPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'privacy-policy' | 'terms-of-service'>('privacy-policy');
  const [privacySections, setPrivacySections] = useState<EditableSection[]>([]);
  const [termsSections, setTermsSections] = useState<EditableSection[]>([]);
  const [privacyVersion, setPrivacyVersion] = useState('1.0');
  const [termsVersion, setTermsVersion] = useState('1.0');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchContent() {
      try {
        setLoading(true);
        setError(null);

        // Fetch privacy policy
        const privacyData = await getPrivacyPolicy();
        setPrivacySections(privacyData.sections.map((s: ContentSection) => ({
          id: s.id,
          title: s.title,
          content: s.content
        })));
        setPrivacyVersion(privacyData.version);

        // Fetch terms of service
        const termsData = await getTermsOfService();
        setTermsSections(termsData.sections.map((s: ContentSection) => ({
          id: s.id,
          title: s.title,
          content: s.content
        })));
        setTermsVersion(termsData.version);
      } catch (err) {
        console.error('Error fetching content:', err);
        setError('Failed to load content. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

    fetchContent();
  }, []);

  const handleSectionChange = (
    type: 'privacy' | 'terms',
    index: number,
    field: 'title' | 'content',
    value: string
  ) => {
    if (type === 'privacy') {
      const updated = [...privacySections];
      updated[index][field] = value;
      setPrivacySections(updated);
    } else {
      const updated = [...termsSections];
      updated[index][field] = value;
      setTermsSections(updated);
    }
  };

  const handleAddSection = (type: 'privacy' | 'terms') => {
    const newSection: EditableSection = {
      id: `section-${Date.now()}`,
      title: 'New Section',
      content: ''
    };

    if (type === 'privacy') {
      setPrivacySections([...privacySections, newSection]);
    } else {
      setTermsSections([...termsSections, newSection]);
    }
  };

  const handleDeleteSection = (type: 'privacy' | 'terms', index: number) => {
    if (type === 'privacy') {
      setPrivacySections(privacySections.filter((_, i) => i !== index));
    } else {
      setTermsSections(termsSections.filter((_, i) => i !== index));
    }
  };

  const handleSave = async (type: 'privacy-policy' | 'terms-of-service') => {
    try {
      setSaving(true);
      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        toast.error('You must be logged in to save content');
        navigate('/auth/signin');
        return;
      }

      const sections = type === 'privacy-policy' ? privacySections : termsSections;
      const version = type === 'privacy-policy' ? privacyVersion : termsVersion;

      await updateContent(type, sections, version, token);
      
      toast.success(`${type === 'privacy-policy' ? 'Privacy Policy' : 'Terms of Service'} updated successfully`);
    } catch (err) {
      console.error('Error saving content:', err);
      toast.error('Failed to save content. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-yellow-500 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading content editor...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background p-6">
        <Alert variant="destructive" className="max-w-2xl mx-auto">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-6xl mx-auto">
          <BackButton to="/admin/dashboard" label="Back to Admin Dashboard" />
          
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Content Editor</h1>
            <p className="text-muted-foreground">
              Manage Privacy Policy and Terms of Service content
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="privacy-policy" className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Privacy Policy
              </TabsTrigger>
              <TabsTrigger value="terms-of-service" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Terms of Service
              </TabsTrigger>
            </TabsList>

            <TabsContent value="privacy-policy">
              <Card className="p-6">
                <div className="mb-6">
                  <Label htmlFor="privacy-version">Version</Label>
                  <Input
                    id="privacy-version"
                    value={privacyVersion}
                    onChange={(e) => setPrivacyVersion(e.target.value)}
                    className="max-w-xs"
                  />
                </div>

                <div className="space-y-6">
                  {privacySections.map((section, index) => (
                    <Card key={section.id} className="p-4 border-2">
                      <div className="flex items-start justify-between mb-4">
                        <h3 className="text-lg font-semibold text-foreground">
                          Section {index + 1}
                        </h3>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteSection('privacy', index)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <Label htmlFor={`privacy-title-${index}`}>Section ID</Label>
                          <Input
                            id={`privacy-id-${index}`}
                            value={section.id}
                            onChange={(e) => handleSectionChange('privacy', index, 'id' as any, e.target.value)}
                          />
                        </div>

                        <div>
                          <Label htmlFor={`privacy-title-${index}`}>Title</Label>
                          <Input
                            id={`privacy-title-${index}`}
                            value={section.title}
                            onChange={(e) => handleSectionChange('privacy', index, 'title', e.target.value)}
                          />
                        </div>

                        <div>
                          <Label htmlFor={`privacy-content-${index}`}>Content</Label>
                          <Textarea
                            id={`privacy-content-${index}`}
                            value={section.content}
                            onChange={(e) => handleSectionChange('privacy', index, 'content', e.target.value)}
                            rows={8}
                            className="font-mono text-sm"
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Use double line breaks (\n\n) to separate paragraphs
                          </p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>

                <div className="flex gap-4 mt-6">
                  <Button
                    onClick={() => handleAddSection('privacy')}
                    variant="outline"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Section
                  </Button>

                  <Button
                    onClick={() => handleSave('privacy-policy')}
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Privacy Policy
                      </>
                    )}
                  </Button>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="terms-of-service">
              <Card className="p-6">
                <div className="mb-6">
                  <Label htmlFor="terms-version">Version</Label>
                  <Input
                    id="terms-version"
                    value={termsVersion}
                    onChange={(e) => setTermsVersion(e.target.value)}
                    className="max-w-xs"
                  />
                </div>

                <div className="space-y-6">
                  {termsSections.map((section, index) => (
                    <Card key={section.id} className="p-4 border-2">
                      <div className="flex items-start justify-between mb-4">
                        <h3 className="text-lg font-semibold text-foreground">
                          Section {index + 1}
                        </h3>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteSection('terms', index)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <Label htmlFor={`terms-id-${index}`}>Section ID</Label>
                          <Input
                            id={`terms-id-${index}`}
                            value={section.id}
                            onChange={(e) => handleSectionChange('terms', index, 'id' as any, e.target.value)}
                          />
                        </div>

                        <div>
                          <Label htmlFor={`terms-title-${index}`}>Title</Label>
                          <Input
                            id={`terms-title-${index}`}
                            value={section.title}
                            onChange={(e) => handleSectionChange('terms', index, 'title', e.target.value)}
                          />
                        </div>

                        <div>
                          <Label htmlFor={`terms-content-${index}`}>Content</Label>
                          <Textarea
                            id={`terms-content-${index}`}
                            value={section.content}
                            onChange={(e) => handleSectionChange('terms', index, 'content', e.target.value)}
                            rows={8}
                            className="font-mono text-sm"
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Use double line breaks (\n\n) to separate paragraphs
                          </p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>

                <div className="flex gap-4 mt-6">
                  <Button
                    onClick={() => handleAddSection('terms')}
                    variant="outline"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Section
                  </Button>

                  <Button
                    onClick={() => handleSave('terms-of-service')}
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Terms of Service
                      </>
                    )}
                  </Button>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
