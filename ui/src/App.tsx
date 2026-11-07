import { useAppApi, useAppInfo } from '@kirocrew/app-sdk'
import {
  Btn,
  EmptyState,
  ErrorNotice,
  Input,
  Modal,
  PageHeader,
  SegmentedControl,
  Select,
} from '@kirocrew/app-sdk/ui'
import { QueryClient, QueryClientProvider, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useMemo, useState } from 'react'
import { S } from './strings'
import type { ProjectsResult } from './types'
import { API, errMessage } from './util'
import GoalsTab from './GoalsTab'
import TaktTab from './TaktTab'
import SettingsTab from './SettingsTab'
import DirBrowser from './DirBrowser'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 0,
    },
  },
})

type TabKey = 'goals' | 'takt' | 'settings'

function Page() {
  const api = useAppApi()
  const info = useAppInfo()
  const active = info.active !== false
  const qc = useQueryClient()

  const [project, setProject] = useState('')
  const [tab, setTab] = useState<TabKey>('goals')
  const [runSlug, setRunSlug] = useState<string | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [showClone, setShowClone] = useState(false)
  const [cloneUrl, setCloneUrl] = useState('')
  const [cloneName, setCloneName] = useState('')
  const [showRemove, setShowRemove] = useState(false)
  const [newPath, setNewPath] = useState('')
  const [browsePath, setBrowsePath] = useState('~')
  const [formError, setFormError] = useState<string | null>(null)

  const projectsQ = useQuery({
    queryKey: ['projects'],
    queryFn: () => api.get<ProjectsResult>(`${API}/projects`),
    refetchInterval: active ? 5000 : false,
  })
  const projects = projectsQ.data?.projects ?? []

  // Default to the first live project; keep the selection when possible.
  useEffect(() => {
    if (!projects.length) {
      setProject('')
      return
    }
    const stillThere = projects.some((p) => p.path === project && !p.missing)
    if (!stillThere) {
      const first = projects.find((p) => !p.missing) ?? projects[0]
      setProject(first.path)
    }
  }, [projects, project])

  const invalidateProjects = () =>
    qc.invalidateQueries({ queryKey: ['projects'] })

  const addMut = useMutation({
    mutationFn: (path: string) =>
      api.post<ProjectsResult>(`${API}/projects/add`, { path }),
    onSuccess: (data) => {
      qc.setQueryData(['projects'], data)
      invalidateProjects()
      setShowAdd(false)
      setNewPath('')
      setFormError(null)
      if (data.projects.length) setProject(data.projects[data.projects.length - 1].path)
    },
    onError: (e) => setFormError(errMessage(e)),
  })

  const cloneMut = useMutation({
    mutationFn: (body: { url: string; parent: string; name?: string }) =>
      api.post<ProjectsResult>(`${API}/projects/clone`, body),
    onSuccess: (data) => {
      qc.setQueryData(['projects'], data)
      setShowClone(false)
      setCloneUrl('')
      setCloneName('')
      setFormError(null)
    },
    onError: (e) => setFormError(errMessage(e)),
  })

  const removeMut = useMutation({
    mutationFn: (path: string) =>
      api.post<ProjectsResult>(`${API}/projects/remove`, { path }),
    onSuccess: (data) => {
      qc.setQueryData(['projects'], data)
      invalidateProjects()
      setShowRemove(false)
      setFormError(null)
    },
    onError: (e) => setFormError(errMessage(e)),
  })

  const selected = projects.find((p) => p.path === project)
  const openRun = (slug: string) => {
    setRunSlug(slug)
    setTab('takt')
  }

  return (
    <>
      <PageHeader
        title={S.appTitle}
        subtitle={S.appSubtitle}
        actions={
          <>
            <Select
              aria-label={S.projectLabel}
              options={projects.map((p) => p.path)}
              optionLabels={projects.map((p) => (p.missing ? `${p.name}（${S.projectMissing}）` : p.name))}
              value={project}
              onChange={setProject}
              className="min-w-[220px]"
            />
            <Btn onClick={() => { setFormError(null); setShowAdd(true) }}>{S.projectAdd}</Btn>
            <Btn onClick={() => { setFormError(null); setShowClone(true) }}>{S.cloneTitle}</Btn>
            <Btn
              danger
              disabled={!selected}
              onClick={() => { setFormError(null); setShowRemove(true) }}
            >
              {S.projectRemove}
            </Btn>
          </>
        }
      />
      <div className="px-6 pb-8 overflow-y-auto flex-1 min-h-0">
        {!projects.length ? (
          <EmptyState
            icon="📁"
            title={S.projectEmpty}
            subtitle={S.projectEmptyHint}
            action={<Btn primary onClick={() => { setFormError(null); setShowAdd(true) }}>{S.projectAdd}</Btn>}
          />
        ) : (
          <>
            {projectsQ.error ? <ErrorNotice message={errMessage(projectsQ.error)} /> : null}
            <div className="mb-4">
              <SegmentedControl<TabKey>
                segments={[
                  { key: 'goals', label: S.tabGoals },
                  { key: 'takt', label: S.tabTakt },
                  { key: 'settings', label: S.tabSettings },
                ]}
                value={tab}
                onChange={setTab}
                ariaLabel={S.appTitle}
              />
            </div>
            {tab === 'settings' ? (
              <SettingsTab active={active} project={project} />
            ) : project ? (
              tab === 'goals' ? (
                <GoalsTab project={project} active={active} onOpenRun={openRun} />
              ) : (
                <TaktTab
                  project={project}
                  hasTakt={selected?.hasTakt ?? false}
                  active={active}
                  runSlug={runSlug}
                  onSelectRun={setRunSlug}
                />
              )
            ) : null}
          </>
        )}
      </div>

      <Modal
        open={showAdd}
        onClose={() => setShowAdd(false)}
        title={S.projectAddTitle}
        footer={
          <>
            <Btn onClick={() => setShowAdd(false)}>{S.cancel}</Btn>
            <Btn
              primary
              disabled={!newPath.trim() || addMut.isPending}
              onClick={() => addMut.mutate(newPath.trim())}
            >
              {S.projectAdd}
            </Btn>
          </>
        }
      >
        <p className="text-sm text-muted mb-2">{S.projectAddHint}</p>
        <DirBrowser
          path={browsePath}
          onNavigate={setBrowsePath}
          onPick={(p) => {
            addMut.mutate(p)
            setShowAdd(false)
          }}
        />
        <p className="text-[12px] text-muted mt-3 mb-1">{S.browseOrType}</p>
        <Input
          value={newPath}
          onChange={(e) => setNewPath(e.target.value)}
          placeholder="/abs/path/to/repo"
          className="w-full"
        />
        {formError ? <ErrorNotice message={formError} /> : null}
      </Modal>

      <Modal
        open={showClone}
        onClose={() => setShowClone(false)}
        title={S.cloneTitle}
        footer={
          <>
            <Btn onClick={() => setShowClone(false)}>{S.cancel}</Btn>
            <Btn
              primary
              disabled={!cloneUrl.trim() || cloneMut.isPending}
              onClick={() =>
                cloneMut.mutate({
                  url: cloneUrl.trim(),
                  parent: browsePath,
                  name: cloneName.trim() || undefined,
                })
              }
            >
              {S.cloneSubmit}
            </Btn>
          </>
        }
      >
        <p className="text-sm text-muted mb-1">{S.cloneUrl}</p>
        <Input
          value={cloneUrl}
          onChange={(e) => setCloneUrl(e.target.value)}
          placeholder={S.cloneUrlHint}
          className="w-full mb-2"
        />
        <p className="text-sm text-muted mb-1">{S.cloneParent}</p>
        <DirBrowser path={browsePath} onNavigate={setBrowsePath} />
        <p className="text-sm text-muted mt-2 mb-1">{S.cloneName}</p>
        <Input
          value={cloneName}
          onChange={(e) => setCloneName(e.target.value)}
          placeholder="repo-name"
          className="w-full"
        />
        {formError ? <ErrorNotice message={formError} /> : null}
      </Modal>

      <Modal
        open={showRemove}
        onClose={() => setShowRemove(false)}
        title={S.projectRemoveTitle}
        footer={
          <>
            <Btn onClick={() => setShowRemove(false)}>{S.cancel}</Btn>
            <Btn
              danger
              disabled={removeMut.isPending}
              onClick={() => selected && removeMut.mutate(selected.path)}
            >
              {S.projectRemove}
            </Btn>
          </>
        }
      >
        <p className="text-sm">
          {selected ? S.projectRemoveConfirm(selected.name) : ''}
        </p>
        {formError ? <ErrorNotice message={formError} /> : null}
      </Modal>
    </>
  )
}

export default function ForTakt() {
  return (
    <QueryClientProvider client={queryClient}>
      <Page />
    </QueryClientProvider>
  )
}
