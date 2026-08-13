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
  const [data, setData] = useState<SettingsData>({ ...EMPTY, ...initialData, hero: { ...EMPTY.hero, ...initialData.hero }, about: { ...EMPTY.about, ...initialData.about }, footer: { ...EMPTY.footer, ...initialData.footer }, contact: { ...EMPTY.contact, ...initialData.contact } })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const setHero = <K extends keyof SettingsData['hero']>(key: K, val: SettingsData['hero'][K]) =>
    setData((d) => ({ ...d, hero: { ...d.hero, [key]: val } }))

  const setAbout = <K extends keyof SettingsData['about']>(key: K, val: SettingsData['about'][K]) =>
    setData((d) => ({ ...d, about: { ...d.about, [key]: val } }))

  const setFooter = <K extends keyof SettingsData['footer']>(key: K, val: SettingsData['footer'][K]) =>
    setData((d) => ({ ...d, footer: { ...d.footer, [key]: val } }))

  const setContact = <K extends keyof SettingsData['contact']>(key: K, val: SettingsData['contact'][K]) =>
    setData((d) => ({ ...d, contact: { ...d.contact, [key]: val } }))

  const toast = useToastStore((s) => s.add)

  const handleSave = async () => {
    setSaving(true)
    const res = await fetch('/api/admin/settings', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ data }) })
    setSaving(false)
    if (res.ok) {
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
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
    <div className="mx-auto max-w-3xl p-6">
      <Tabs defaultValue="hero">
        <TabsList className="mb-6">
          <TabsTrigger value="hero">Hero</TabsTrigger>
          <TabsTrigger value="about">About</TabsTrigger>
          <TabsTrigger value="footer">Footer</TabsTrigger>
          <TabsTrigger value="contact">Contact</TabsTrigger>
        </TabsList>

        {/* Hero Tab */}
        <TabsContent value="hero" className="space-y-4">
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
        </TabsContent>

        {/* About Tab */}
        <TabsContent value="about" className="space-y-4">
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
            {data.about.stats.map((stat, i) => (
              <div key={i} className="flex items-center gap-2">
                <Input value={stat.num} onChange={(e) => updateStat(i, 'num', e.target.value)} placeholder="5+" className="w-24" />
                <Input value={stat.label} onChange={(e) => updateStat(i, 'label', e.target.value)} placeholder="Years" className="flex-1" />
                <Button type="button" variant="ghost" size="sm" onClick={() => removeStat(i)} className="text-red-500">Remove</Button>
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={addStat}>Add Stat</Button>
          </div>
          <div className="space-y-2">
            <Label>About Images (URLs)</Label>
            <ArrayInput value={data.about.images} onChange={(imgs) => setAbout('images', imgs)} placeholder="Image URL" />
          </div>
        </TabsContent>

        {/* Footer Tab */}
        <TabsContent value="footer" className="space-y-4">
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
            {data.footer.socialLinks.map((link, i) => (
              <div key={i} className="flex items-center gap-2">
                <Input value={link.label} onChange={(e) => updateSocialLink(i, 'label', e.target.value)} placeholder="LinkedIn" className="w-32" />
                <Input value={link.url} onChange={(e) => updateSocialLink(i, 'url', e.target.value)} placeholder="https://..." className="flex-1" />
                <Button type="button" variant="ghost" size="sm" onClick={() => removeSocialLink(i)} className="text-red-500">Remove</Button>
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={addSocialLink}>Add Link</Button>
          </div>
          <div className="space-y-2">
            <Label>Footer Images (URLs)</Label>
            <ArrayInput value={data.footer.images} onChange={(imgs) => setFooter('images', imgs)} placeholder="Image URL" />
          </div>
        </TabsContent>

        {/* Contact Tab */}
        <TabsContent value="contact" className="space-y-4">
          <div className="space-y-2">
            <Label>Interest Options</Label>
            <ArrayInput value={data.contact.interests} onChange={(ints) => setContact('interests', ints)} placeholder="e.g. Web Development" />
          </div>
          <div className="space-y-2">
            <Label>Phone Placeholder</Label>
            <Input value={data.contact.phonePlaceholder} onChange={(e) => setContact('phonePlaceholder', e.target.value)} />
          </div>
        </TabsContent>
      </Tabs>

      <div className="mt-8 flex items-center gap-3">
        <Button onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save Settings'}</Button>
        {saved && <span className="text-sm text-green-600">Settings saved!</span>}
      </div>
    </div>
  )
}
