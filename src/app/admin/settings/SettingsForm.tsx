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
import ArrayInput from '@/components/admin/ArrayInput'
import GalleryMediaInput from '@/components/admin/GalleryMediaInput'
import TaxonomyManager from '@/components/admin/TaxonomyManager'
import MediaField from '@/components/admin/MediaField'
import PortraitPositionPicker from '@/components/admin/PortraitPositionPicker'
import FormSection from '@/components/admin/FormSection'
import { parseWordReveal } from '@/lib/wordReveal'
import { X, Plus } from 'lucide-react'

interface SocialLink {
  label: string
  url: string
}

interface Stat {
  num: string
  label: string
}

interface ImagePosition {
  x: number
  y: number
  zoom: number
}

interface SettingsData {
  general: {
    maintenanceMode: boolean
  }
  hero: {
    heading: string
    bio: string
    marqueeText: string
    location: string
    availabilityStatus: boolean
    availabilityText: string
    portraitImage: string
    portraitPositionDesktop: ImagePosition
    portraitPositionTablet: ImagePosition
    portraitPositionMobile: ImagePosition
  }
  about: {
    storyParagraph1: string
    storyParagraph2: string
    /* Markup text ("*italic*" / "**accent**"), parsed into the per-word
       array AboutSection actually renders — see src/lib/wordReveal.ts.
       Was scrollRevealWords: WordItem[] (a per-word array), but nothing
       ever built a UI for editing that shape, and this heading is a
       sentence someone's writing, not a list of independent word rows —
       replaced instead of adding a second, differently-shaped field. */
    scrollRevealText: string
    stats: Stat[]
    images: string[]
  }
  footer: {
    email: string
    socialLinks: SocialLink[]
    tickerText: string
    /* Markup text ("*italic*" / "**accent**"), parsed via
       src/lib/wordReveal.ts — same fix as about.scrollRevealText.
       Was wordReveal: WordItem[], declared but with no admin UI ever
       built for it. Worse than just unreachable: this form always
       initialized the field to [], and FooterSection.tsx read it as
       `settings.wordReveal || WORDS` — an empty ARRAY is truthy in JS,
       so that fallback never actually engaged once any settings tab
       was saved once for any reason, silently blanking this heading
       sitewide with no error anywhere. */
    wordRevealText: string
    images: string[]
    copyrightName: string
    techCredits: string
  }
  contact: {
    interests: string[]
    phonePlaceholder: string
  }
  whatsapp: {
    enabled: boolean
    number: string
    profileImage: string
    displayName: string
    greetingMessage: string
  }
  seo: {
    siteName: string
    titleTemplate: string
    defaultTitle: string
    defaultDescription: string
    defaultOgImage: string
    twitterHandle: string
    work: { title: string; description: string }
    services: { title: string; description: string }
    blog: { title: string; description: string }
  }
}

const EMPTY: SettingsData = {
  general: { maintenanceMode: false },
  hero: {
    heading: '', bio: '', marqueeText: '', location: '', availabilityStatus: true, availabilityText: '', portraitImage: '',
    /* Matches the previous hardcoded object-position:top default (50% 0%) —
       existing sites see no visual change until an admin adjusts this. */
    portraitPositionDesktop: { x: 50, y: 0, zoom: 100 },
    portraitPositionTablet:  { x: 50, y: 0, zoom: 100 },
    portraitPositionMobile:  { x: 50, y: 0, zoom: 100 },
  },
  about: { storyParagraph1: '', storyParagraph2: '', scrollRevealText: '', stats: [], images: [] },
  footer: { email: '', socialLinks: [], tickerText: '', wordRevealText: '', images: [], copyrightName: '', techCredits: '' },
  contact: { interests: [], phonePlaceholder: '' },
  whatsapp: {
    enabled: false, number: '', profileImage: '', displayName: 'Aftab',
    greetingMessage: 'Hi there 👋, How can I help you?',
  },
  seo: {
    siteName: 'Aftab',
    titleTemplate: '%s | Aftab',
    defaultTitle: 'Aftab — Creative Developer',
    defaultDescription: 'Creative developer crafting immersive digital experiences that push the limits of the web.',
    defaultOgImage: '',
    twitterHandle: '',
    work: { title: 'Work', description: '' },
    services: { title: 'Services', description: '' },
    blog: { title: 'Blog', description: '' },
  },
}

export default function SettingsForm({ initialData }: { initialData: Partial<SettingsData> }) {
  const router = useRouter()
  const toast = useToastStore((s) => s.add)
  const [data, setData] = useState<SettingsData>({
    ...EMPTY,
    ...initialData,
    general: { ...EMPTY.general, ...initialData.general },
    hero: {
      ...EMPTY.hero,
      ...initialData.hero,
      portraitPositionDesktop: { ...EMPTY.hero.portraitPositionDesktop, ...initialData.hero?.portraitPositionDesktop },
      portraitPositionTablet:  { ...EMPTY.hero.portraitPositionTablet,  ...initialData.hero?.portraitPositionTablet },
      portraitPositionMobile:  { ...EMPTY.hero.portraitPositionMobile,  ...initialData.hero?.portraitPositionMobile },
    },
    about: { ...EMPTY.about, ...initialData.about },
    footer: { ...EMPTY.footer, ...initialData.footer },
    contact: { ...EMPTY.contact, ...initialData.contact },
    whatsapp: { ...EMPTY.whatsapp, ...initialData.whatsapp },
    seo: {
      ...EMPTY.seo,
      ...initialData.seo,
      work: { ...EMPTY.seo.work, ...initialData.seo?.work },
      services: { ...EMPTY.seo.services, ...initialData.seo?.services },
      blog: { ...EMPTY.seo.blog, ...initialData.seo?.blog },
    },
  })
  const [saving, setSaving] = useState(false)

  const setGeneral = <K extends keyof SettingsData['general']>(key: K, val: SettingsData['general'][K]) =>
    setData((d) => ({ ...d, general: { ...d.general, [key]: val } }))

  const setHero = <K extends keyof SettingsData['hero']>(key: K, val: SettingsData['hero'][K]) =>
    setData((d) => ({ ...d, hero: { ...d.hero, [key]: val } }))

  const setAbout = <K extends keyof SettingsData['about']>(key: K, val: SettingsData['about'][K]) =>
    setData((d) => ({ ...d, about: { ...d.about, [key]: val } }))

  const setFooter = <K extends keyof SettingsData['footer']>(key: K, val: SettingsData['footer'][K]) =>
    setData((d) => ({ ...d, footer: { ...d.footer, [key]: val } }))

  const setContact = <K extends keyof SettingsData['contact']>(key: K, val: SettingsData['contact'][K]) =>
    setData((d) => ({ ...d, contact: { ...d.contact, [key]: val } }))

  const setWhatsapp = <K extends keyof SettingsData['whatsapp']>(key: K, val: SettingsData['whatsapp'][K]) =>
    setData((d) => ({ ...d, whatsapp: { ...d.whatsapp, [key]: val } }))

  const setSeo = <K extends keyof SettingsData['seo']>(key: K, val: SettingsData['seo'][K]) =>
    setData((d) => ({ ...d, seo: { ...d.seo, [key]: val } }))

  const setSeoSection = (section: 'work' | 'services' | 'blog', field: 'title' | 'description', value: string) =>
    setData((d) => ({ ...d, seo: { ...d.seo, [section]: { ...d.seo[section], [field]: value } } }))

  const handleSave = async () => {
    setSaving(true)
    const res = await fetch('/api/admin/settings', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
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
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="hero">Hero</TabsTrigger>
            <TabsTrigger value="about">About</TabsTrigger>
            <TabsTrigger value="footer">Footer</TabsTrigger>
            <TabsTrigger value="contact">Contact</TabsTrigger>
            <TabsTrigger value="whatsapp">WhatsApp</TabsTrigger>
            <TabsTrigger value="taxonomies">Taxonomies</TabsTrigger>
            <TabsTrigger value="seo">SEO</TabsTrigger>
          </TabsList>

          {/* General Tab */}
          <TabsContent value="general" className="mt-0">
            <FormSection title="Maintenance Mode" description="Temporarily replace the entire public site with a single maintenance page">
              <div className="flex items-center gap-2">
                <Checkbox checked={data.general.maintenanceMode} onCheckedChange={(v) => setGeneral('maintenanceMode', v === true)} />
                <Label>Site is under maintenance</Label>
              </div>
              <p className="text-xs text-neutral-500">
                When enabled, every public page shows a maintenance screen instead of its normal content
                (the header, menu, and footer are hidden too — visitors can&apos;t navigate anywhere else).
                This admin dashboard, including this settings page and the login page, stays fully
                accessible the whole time, so you can turn it back off from here once you&apos;re done.
                Uses the same contact email set in the Footer tab.
              </p>
            </FormSection>
          </TabsContent>

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
                <MediaField value={data.hero.portraitImage} onChange={(url) => setHero('portraitImage', url)} />
              </div>
              <div className="space-y-2">
                <Label>Portrait Position</Label>
                <p className="text-xs text-neutral-500">
                  Drag to set the focal point, zoom for pan room — desktop, tablet, and mobile crop
                  independently, exactly as they render on the live site. Tablet covers both portrait
                  and landscape tablet widths (768-1279px), which share one crop box on the frontend.
                </p>
                <div className="flex flex-wrap gap-4">
                  <PortraitPositionPicker
                    label="Desktop"
                    imageUrl={data.hero.portraitImage}
                    value={data.hero.portraitPositionDesktop}
                    onChange={(pos) => setHero('portraitPositionDesktop', pos)}
                    aspectRatio={0.5}
                  />
                  <PortraitPositionPicker
                    label="Tablet"
                    imageUrl={data.hero.portraitImage}
                    value={data.hero.portraitPositionTablet}
                    onChange={(pos) => setHero('portraitPositionTablet', pos)}
                    aspectRatio={1.3}
                  />
                  <PortraitPositionPicker
                    label="Mobile"
                    imageUrl={data.hero.portraitImage}
                    value={data.hero.portraitPositionMobile}
                    onChange={(pos) => setHero('portraitPositionMobile', pos)}
                    aspectRatio={0.68}
                  />
                </div>
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
                <Label>Scroll Reveal Heading</Label>
                <Textarea
                  value={data.about.scrollRevealText}
                  onChange={(e) => setAbout('scrollRevealText', e.target.value)}
                  rows={3}
                  placeholder="I *taught myself by building things.* It started with a **C++** project in 2016."
                  className="font-mono text-sm"
                />
                <p className="text-xs text-neutral-500">
                  The big word-by-word heading that reveals as the About section scrolls into view.
                  Wrap words in <code className="rounded bg-neutral-100 px-1">*single asterisks*</code> for
                  italic, or <code className="rounded bg-neutral-100 px-1">**double asterisks**</code> for
                  the orange accent word — the accent word also shows a cycling photo on hover, so use it
                  on the one word you most want to draw attention to. Leave blank to keep the current default.
                </p>
                {data.about.scrollRevealText.trim() && (
                  <div className="rounded-md border border-neutral-200 bg-neutral-50 px-4 py-3 text-lg font-bold leading-snug">
                    {parseWordReveal(data.about.scrollRevealText).map((word, i) => (
                      <span key={i}>
                        <span
                          style={{
                            fontStyle: word.italic ? 'italic' : 'normal',
                            color: word.accent ? '#ff4d00' : undefined,
                          }}
                        >
                          {word.w}
                        </span>{' '}
                      </span>
                    ))}
                  </div>
                )}
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
                <Label>Scroll Reveal Heading</Label>
                <Textarea
                  value={data.footer.wordRevealText}
                  onChange={(e) => setFooter('wordRevealText', e.target.value)}
                  rows={2}
                  placeholder="Whether you're **starting** from scratch or *improving an existing product,* let's build something real."
                  className="font-mono text-sm"
                />
                <p className="text-xs text-neutral-500">
                  The word-by-word statement that reveals as the footer scrolls into view. Same markup as the About
                  heading: <code className="rounded bg-neutral-100 px-1">*single asterisks*</code> for italic,{' '}
                  <code className="rounded bg-neutral-100 px-1">**double asterisks**</code> for the orange accent
                  word. Leave blank to keep the current default.
                </p>
                {data.footer.wordRevealText.trim() && (
                  <div className="rounded-md border border-neutral-200 bg-neutral-50 px-4 py-3 text-lg font-bold leading-snug">
                    {parseWordReveal(data.footer.wordRevealText).map((word, i) => (
                      <span key={i}>
                        <span
                          style={{
                            fontStyle: word.italic ? 'italic' : 'normal',
                            color: word.accent ? '#ff4d00' : undefined,
                          }}
                        >
                          {word.w}
                        </span>{' '}
                      </span>
                    ))}
                  </div>
                )}
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

          {/* WhatsApp Tab */}
          <TabsContent value="whatsapp" className="mt-0">
            <FormSection title="WhatsApp Widget" description="A floating chat prompt shown across the site. Visitors can type a message, then 'Chat With Us' opens WhatsApp with it pre-filled — nothing is sent from your server.">
              <div className="flex items-center gap-2">
                <Checkbox checked={data.whatsapp.enabled} onCheckedChange={(v) => setWhatsapp('enabled', v === true)} />
                <Label>Show the WhatsApp button on the site</Label>
              </div>

              {/* The widget needs both the toggle AND a number — a wa.me
                  link can't be built without one, so it stays hidden.
                  Without this warning that's a silent no-op: the box is
                  ticked, saved successfully, and nothing appears on the
                  site with no explanation why. */}
              {data.whatsapp.enabled && !data.whatsapp.number.trim() && (
                <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
                  Add your WhatsApp number below — until then the button stays hidden on the
                  site, because the chat link can&apos;t be built without it.
                </p>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>WhatsApp Number</Label>
                  <Input
                    value={data.whatsapp.number}
                    onChange={(e) => setWhatsapp('number', e.target.value)}
                    placeholder="+971 50 123 4567"
                  />
                  <p className="text-xs text-neutral-400">Include the country code. Spaces and dashes are fine — only the digits are used.</p>
                </div>
                <div className="space-y-2">
                  <Label>Display Name</Label>
                  <Input value={data.whatsapp.displayName} onChange={(e) => setWhatsapp('displayName', e.target.value)} placeholder="Aftab" />
                  <p className="text-xs text-neutral-400">Shown beside the profile image in the widget header.</p>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Greeting Message</Label>
                <Textarea
                  value={data.whatsapp.greetingMessage}
                  onChange={(e) => setWhatsapp('greetingMessage', e.target.value)}
                  rows={2}
                  placeholder="Hi there 👋, How can I help you?"
                />
                <p className="text-xs text-neutral-400">Your greeting, shown in the widget. If a visitor sends without typing anything, this is what gets pre-filled in WhatsApp instead.</p>
              </div>
              <div className="space-y-2">
                <Label>Profile Image</Label>
                <MediaField value={data.whatsapp.profileImage} onChange={(url) => setWhatsapp('profileImage', url)} size="sm" />
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

          {/* SEO Tab */}
          <TabsContent value="seo" className="mt-0">
            <FormSection title="SEO Defaults" description="Site-wide search engine and social sharing defaults. Individual Projects, Services, and Posts can override these.">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Site Name</Label>
                  <Input value={data.seo.siteName} onChange={(e) => setSeo('siteName', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Title Template</Label>
                  <Input value={data.seo.titleTemplate} onChange={(e) => setSeo('titleTemplate', e.target.value)} placeholder="%s | Aftab" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Default Meta Title</Label>
                  <span className={`text-xs ${data.seo.defaultTitle.length > 60 ? 'text-red-500' : 'text-neutral-400'}`}>{data.seo.defaultTitle.length}/60</span>
                </div>
                <Input value={data.seo.defaultTitle} onChange={(e) => setSeo('defaultTitle', e.target.value)} />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Default Meta Description</Label>
                  <span className={`text-xs ${data.seo.defaultDescription.length > 160 ? 'text-red-500' : 'text-neutral-400'}`}>{data.seo.defaultDescription.length}/160</span>
                </div>
                <Textarea value={data.seo.defaultDescription} onChange={(e) => setSeo('defaultDescription', e.target.value)} rows={3} />
              </div>
              <div className="space-y-2">
                <Label>Default Social Share Image</Label>
                <p className="text-xs text-neutral-400">Used when a Project, Service, or Post doesn&apos;t have its own SEO image set</p>
                <MediaField value={data.seo.defaultOgImage} onChange={(url) => setSeo('defaultOgImage', url)} />
              </div>
              <div className="space-y-2">
                <Label>Twitter Handle</Label>
                <Input value={data.seo.twitterHandle} onChange={(e) => setSeo('twitterHandle', e.target.value)} placeholder="@yourhandle" className="max-w-xs" />
              </div>
            </FormSection>

            <FormSection title="Page Titles & Descriptions" description="SEO for the Work, Services, and Blog index pages">
              {(['work', 'services', 'blog'] as const).map((section) => (
                <div key={section} className="space-y-2 border-b border-neutral-100 pb-4 last:border-0 last:pb-0">
                  <Label className="capitalize">{section}</Label>
                  <Input
                    value={data.seo[section].title}
                    onChange={(e) => setSeoSection(section, 'title', e.target.value)}
                    placeholder="Meta title"
                    className="text-sm"
                  />
                  <Textarea
                    value={data.seo[section].description}
                    onChange={(e) => setSeoSection(section, 'description', e.target.value)}
                    placeholder="Meta description"
                    rows={2}
                    className="text-sm"
                  />
                </div>
              ))}
            </FormSection>
          </TabsContent>
        </Tabs>
      </div>
    </>
  )
}
