'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useToastStore } from '@/store/useToastStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import ImageUpload from '@/components/admin/ImageUpload'
import ArrayInput from '@/components/admin/ArrayInput'
import GalleryMediaInput from '@/components/admin/GalleryMediaInput'
import TaxonomyManager from '@/components/admin/TaxonomyManager'
import FormSection from '@/components/admin/FormSection'
import { X, Plus } from 'lucide-react'

interface WordItem {
  w: string
  italic?: boolean
  accent?: boolean
}

interface SocialLink {
  label: string
  url: string
}

interface Stat {
  num: string
  label: string
}

interface SettingsData {
  hero: {
    heading: string
    bio: string
    marqueeText: string
    location: string
    availabilityStatus: boolean
    availabilityText: string
    portraitImage: string
  }
  about: {
    storyParagraph1: string
    storyParagraph2: string
    scrollRevealWords: WordItem[]
    stats: Stat[]
    images: string[]
  }
  footer: {
    email: string
    socialLinks: SocialLink[]
    tickerText: string
    wordReveal: WordItem[]
    images: string[]
    copyrightName: string
    techCredits: string
  }
  contact: {
    interests: string[]
    phonePlaceholder: string
  }
}

const EMPTY: SettingsData = {
  hero: { heading: '', bio: '', marqueeText: '', location: '', availabilityStatus: true, availabilityText: '', portraitImage: '' },
  about: { storyParagraph1: '', storyParagraph2: '', scrollRevealWords: [], stats: [], images: [] },
  footer: { email: '', socialLinks: [], tickerText: '', wordReveal: [], images: [], copyrightName: '', techCredits: '' },
  contact: { interests: [], phonePlaceholder: '' },
}

export default function SettingsForm({ initialData }: { initialData: Partial<SettingsData> }) {
  const router = useRouter()
  const toast = useToastStore((s) => s.add)
  const [data, setData] = useState<SettingsData>({ ...EMPTY, ...initialData, hero: { ...EMPTY.hero, ...initialData.hero }, about: { ...EMPTY.about, ...initialData.about }, footer: { ...EMPTY.footer, ...initialData.footer }, contact: { ...EMPTY.contact, ...initialData.contact } })
  const [saving, setSaving] = useState(false)

  const setHero = <K extends keyof SettingsData['hero']>(key: K, val: SettingsData['hero'][K]) =>
    setData((d) => ({ ...d, hero: { ...d.hero, [key]: val } }))

  const setAbout = <K extends keyof SettingsData['about']>(key: K, val: SettingsData['about'][K]) =>
    setData((d) => ({ ...d, about: { ...d.about, [key]: val } }))

  const setFooter = <K extends keyof SettingsData['footer']>(key: K, val: SettingsData['footer'][K]) =>
    setData((d) => ({ ...d, footer: { ...d.footer, [key]: val } }))

  const setContact = <K extends keyof SettingsData['contact']>(key: K, val: SettingsData['contact'][K]) =>
    setData((d) => ({ ...d, contact: { ...d.contact, [key]: val } }))

  const handleSave = async () => {
    setSaving(true)
    const res = await fetch('/api/admin/settings', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ data }) })
    setSaving(false)
    if (res.ok) {
      toast('Settings saved')
    } else {
      toast('Failed to save settings', 'error')
    }
    router.refresh()
  }

  const updateStat = (index: number, field: 'num' | 'label', value: string) => {
    const stats = [...data.about.stats]
    stats[index] = { ...stats[index], [field]: value }
    setAbout('stats', stats)
  }

  const addStat = () => setAbout('stats', [...data.about.stats, { num: '', label: '' }])
  const removeStat = (i: number) => setAbout('stats', data.about.stats.filter((_, idx) => idx !== i))

  const updateSocialLink = (index: number, field: 'label' | 'url', value: string) => {
    const links = [...data.footer.socialLinks]
    links[index] = { ...links[index], [field]: value }
    setFooter('socialLinks', links)
  }

  const addSocialLink = () => setFooter('socialLinks', [...data.footer.socialLinks, { label: '', url: '' }])
  const removeSocialLink = (i: number) => setFooter('socialLinks', data.footer.socialLinks.filter((_, idx) => idx !== i))

  return (
    <>
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-neutral-200 bg-white/90 px-6 py-3 backdrop-blur">
        <span className="text-sm font-medium text-neutral-500">Site-wide content, shown across the live site</span>
        <Button onClick={handleSave} disabled={saving} size="sm">
          {saving ? 'Saving…' : 'Save Settings'}
        </Button>
      </div>

      <div className="max-w-3xl p-6">
        <Tabs defaultValue="hero">
          <TabsList className="mb-4">
            <TabsTrigger value="hero">Hero</TabsTrigger>
            <TabsTrigger value="about">About</TabsTrigger>
            <TabsTrigger value="footer">Footer</TabsTrigger>
            <TabsTrigger value="contact">Contact</TabsTrigger>
            <TabsTrigger value="taxonomies">Taxonomies</TabsTrigger>
          </TabsList>

          {/* Hero Tab */}
          <TabsContent value="hero" className="mt-0">
            <FormSection title="Hero" description="The landing headline and portrait shown at the top of the homepage">
              <div className="space-y-2">
                <Label>Heading</Label>
                <Input value={data.hero.heading} onChange={(e) => setHero('heading', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Bio</Label>
                <Textarea value={data.hero.bio} onChange={(e) => setHero('bio', e.target.value)} rows={4} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Marquee Text</Label>
                  <Input value={data.hero.marqueeText} onChange={(e) => setHero('marqueeText', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Location</Label>
                  <Input value={data.hero.location} onChange={(e) => setHero('location', e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Availability Text</Label>
                <Input value={data.hero.availabilityText} onChange={(e) => setHero('availabilityText', e.target.value)} />
              </div>
              <div className="flex items-center gap-2">
                <Checkbox checked={data.hero.availabilityStatus} onCheckedChange={(v) => setHero('availabilityStatus', v === true)} />
                <Label>Available for work</Label>
              </div>
              <div className="space-y-2">
                <Label>Portrait Image</Label>
                <ImageUpload value={data.hero.portraitImage} onChange={(url) => setHero('portraitImage', url)} />
              </div>
            </FormSection>
          </TabsContent>

          {/* About Tab */}
          <TabsContent value="about" className="mt-0">
            <FormSection title="About" description="The story section and stats further down the homepage">
              <div className="space-y-2">
                <Label>Story Paragraph 1</Label>
                <Textarea value={data.about.storyParagraph1} onChange={(e) => setAbout('storyParagraph1', e.target.value)} rows={4} />
              </div>
              <div className="space-y-2">
                <Label>Story Paragraph 2</Label>
                <Textarea value={data.about.storyParagraph2} onChange={(e) => setAbout('storyParagraph2', e.target.value)} rows={4} />
              </div>
              <div className="space-y-2">
                <Label>Stats</Label>
                <div className="space-y-1.5">
                  {data.about.stats.map((stat, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <Input value={stat.num} onChange={(e) => updateStat(i, 'num', e.target.value)} placeholder="5+" className="h-8 w-24 text-sm" />
                      <Input value={stat.label} onChange={(e) => updateStat(i, 'label', e.target.value)} placeholder="Years" className="h-8 flex-1 text-sm" />
                      <Button type="button" variant="ghost" size="icon" onClick={() => removeStat(i)} className="h-8 w-8 shrink-0 text-neutral-400 hover:text-red-500">
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
                <Button type="button" variant="outline" size="sm" onClick={addStat} className="h-7 gap-1 text-xs">
                  <Plus className="h-3 w-3" /> Add Stat
                </Button>
              </div>
              <GalleryMediaInput value={data.about.images} onChange={(imgs) => setAbout('images', imgs)} label="About Images" />
            </FormSection>
          </TabsContent>

          {/* Footer Tab */}
          <TabsContent value="footer" className="mt-0">
            <FormSection title="Footer" description="Contact details and links shown in the site footer">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input value={data.footer.email} onChange={(e) => setFooter('email', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Copyright Name</Label>
                  <Input value={data.footer.copyrightName} onChange={(e) => setFooter('copyrightName', e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Tech Credits</Label>
                <Input value={data.footer.techCredits} onChange={(e) => setFooter('techCredits', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Ticker Text</Label>
                <Textarea value={data.footer.tickerText} onChange={(e) => setFooter('tickerText', e.target.value)} rows={2} />
              </div>
              <div className="space-y-2">
                <Label>Social Links</Label>
                <div className="space-y-1.5">
                  {data.footer.socialLinks.map((link, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <Input value={link.label} onChange={(e) => updateSocialLink(i, 'label', e.target.value)} placeholder="LinkedIn" className="h-8 w-32 text-sm" />
                      <Input value={link.url} onChange={(e) => updateSocialLink(i, 'url', e.target.value)} placeholder="https://..." className="h-8 flex-1 text-sm" />
                      <Button type="button" variant="ghost" size="icon" onClick={() => removeSocialLink(i)} className="h-8 w-8 shrink-0 text-neutral-400 hover:text-red-500">
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
                <Button type="button" variant="outline" size="sm" onClick={addSocialLink} className="h-7 gap-1 text-xs">
                  <Plus className="h-3 w-3" /> Add Link
                </Button>
              </div>
              <GalleryMediaInput value={data.footer.images} onChange={(imgs) => setFooter('images', imgs)} label="Footer Images" />
            </FormSection>
          </TabsContent>

          {/* Contact Tab */}
          <TabsContent value="contact" className="mt-0">
            <FormSection title="Contact" description="Options shown in the contact form modal">
              <div className="space-y-2">
                <Label>Interest Options</Label>
                <ArrayInput value={data.contact.interests} onChange={(ints) => setContact('interests', ints)} placeholder="e.g. Web Development" />
              </div>
              <div className="space-y-2">
                <Label>Phone Placeholder</Label>
                <Input value={data.contact.phonePlaceholder} onChange={(e) => setContact('phonePlaceholder', e.target.value)} />
              </div>
            </FormSection>
          </TabsContent>

          {/* Taxonomies Tab */}
          <TabsContent value="taxonomies" className="mt-0">
            <FormSection title="Taxonomies" description="Manage the values available in the Type and Category dropdowns on Projects and Blog posts">
              <TaxonomyManager
                label="Project Types"
                description="Shown in the Type dropdown on the Project form"
                apiPath="/api/admin/project-types"
                listKey="types"
                placeholder="e.g. E-commerce"
              />
              <TaxonomyManager
                label="Blog Categories"
                description="Shown in the Category dropdown on the Post form"
                apiPath="/api/admin/post-categories"
                listKey="categories"
                placeholder="e.g. Design"
              />
            </FormSection>
          </TabsContent>
        </Tabs>
      </div>
    </>
  )
}
