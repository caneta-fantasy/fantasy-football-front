// Caneta Fantasy design-system barrel.
// Re-exports every component + tokens once. Generated for Plan Task 9.

// ----- Tokens -----
export { tokens } from './tokens'
export type { Tokens } from './tokens'

// ----- Signature / modernista primitives -----
export { Overline, SectionLabel } from './Overline/Overline'
export type { OverlineProps } from './Overline/Overline'

export { Azulejo } from './Azulejo/Azulejo'
export type { AzulejoProps } from './Azulejo/Azulejo'

// ----- Brand (app logo / crest / wordmark) -----
export { BrandCrest, Wordmark, BrandLockup } from './Brand/Brand'
export type { BrandCrestProps, WordmarkProps, BrandLockupProps } from './Brand/Brand'

export { AzulejoBand } from './AzulejoBand/AzulejoBand'
export type { AzulejoBandProps } from './AzulejoBand/AzulejoBand'

export { ArchShape } from './ArchShape/ArchShape'
export type { ArchShapeProps } from './ArchShape/ArchShape'

export { ArchPanel } from './ArchPanel/ArchPanel'
export type { ArchPanelProps } from './ArchPanel/ArchPanel'

export { TickerBar } from './TickerBar/TickerBar'
export type { TickerBarProps, TickerItem, TickerTone } from './TickerBar/TickerBar'

export { ArchHeader } from './ArchHeader/ArchHeader'
export type {
  ArchHeaderProps,
  ArchHeaderTone,
  ArchHeaderPattern,
} from './ArchHeader/ArchHeader'

// ----- Core primitives -----
export { Spinner } from './Spinner/Spinner'
export type { SpinnerProps } from './Spinner/Spinner'

export { Icon } from './Icon/Icon'
export type { IconProps, IconName, IconSize } from './Icon/Icon'

export { Btn } from './Btn/Btn'
export type { BtnProps } from './Btn/Btn'

export { Card } from './Card/Card'
export type { CardProps } from './Card/Card'

export { Chip } from './Chip/Chip'
export type { ChipProps, ChipTone } from './Chip/Chip'

// ----- Form field primitives -----
export { Label } from './Label/Label'
export type { LabelProps } from './Label/Label'

export { Help } from './Help/Help'
export type { HelpProps, HelpTone } from './Help/Help'

export { FieldGroup } from './FieldGroup/FieldGroup'
export type { FieldGroupProps } from './FieldGroup/FieldGroup'

export { TextInput } from './TextInput/TextInput'
export type { TextInputProps } from './TextInput/TextInput'

export { PasswordInput } from './PasswordInput/PasswordInput'
export type { PasswordInputProps } from './PasswordInput/PasswordInput'

export { SearchInput } from './SearchInput/SearchInput'
export type { SearchInputProps } from './SearchInput/SearchInput'

export { Checkbox } from './Checkbox/Checkbox'
export type { CheckboxProps } from './Checkbox/Checkbox'

export { Switch } from './Switch/Switch'
export type { SwitchProps } from './Switch/Switch'

export { RadioGroup } from './RadioGroup/RadioGroup'
export type { RadioGroupProps } from './RadioGroup/RadioGroup'

export { Radio } from './Radio/Radio'
export type { RadioProps } from './Radio/Radio'

export { Slider } from './Slider/Slider'
export type { SliderProps } from './Slider/Slider'

export { Stepper } from './Stepper/Stepper'
export type { StepperProps } from './Stepper/Stepper'

export { Textarea } from './Textarea/Textarea'
export type { TextareaProps } from './Textarea/Textarea'

export { Select } from './Select/Select'
export type { SelectProps, SelectOption } from './Select/Select'

export { Combobox } from './Combobox/Combobox'
export type { ComboboxProps, ComboboxOption } from './Combobox/Combobox'

export { DateInput } from './DateInput/DateInput'
export type { DateInputProps } from './DateInput/DateInput'

// ----- Data display -----
export { Table } from './Table/Table'
export type {
  TableProps,
  Column,
  SortState,
  SortDirection,
  Align,
} from './Table/Table'

// ----- Overlay primitives -----
export { useOverlay } from './overlay/useOverlay'
export type { UseOverlayOptions } from './overlay/useOverlay'

export { Scrim } from './overlay/Scrim'
export type { ScrimProps } from './overlay/Scrim'

export { Modal } from './Modal/Modal'
export type { ModalProps } from './Modal/Modal'

export { Drawer } from './Drawer/Drawer'
export type { DrawerProps } from './Drawer/Drawer'

export { BottomSheet } from './BottomSheet/BottomSheet'
export type { BottomSheetProps } from './BottomSheet/BottomSheet'

export { Tooltip } from './Tooltip/Tooltip'
export type { TooltipProps } from './Tooltip/Tooltip'

export { Popover } from './Popover/Popover'
export type { PopoverProps } from './Popover/Popover'

export { DropdownMenu } from './DropdownMenu/DropdownMenu'
export type { DropdownMenuProps, DropdownMenuItem } from './DropdownMenu/DropdownMenu'

// ----- Toast -----
export { Toast } from './Toast/Toast'
export type { ToastProps, ToastTone, ToastAction } from './Toast/Toast'

export { ToastProvider, useToast } from './Toast/ToastProvider'
export type {
  ToastProviderProps,
  ToastOptions,
  ToastHandle,
  ToastFn,
  ToastPosition,
} from './Toast/ToastProvider'

// ----- Navigation -----
export { Tabs } from './Tabs/Tabs'
export type { TabsProps, TabItem } from './Tabs/Tabs'

export { Breadcrumbs } from './Breadcrumbs/Breadcrumbs'
export type { BreadcrumbsProps, BreadcrumbItem } from './Breadcrumbs/Breadcrumbs'

export { Pagination } from './Pagination/Pagination'
export type { PaginationProps } from './Pagination/Pagination'

// ----- Feedback -----
export { Skeleton } from './Skeleton/Skeleton'
export type { SkeletonProps } from './Skeleton/Skeleton'

export { ProgressBar } from './ProgressBar/ProgressBar'
export type { ProgressBarProps } from './ProgressBar/ProgressBar'

export { ProgressRing } from './ProgressRing/ProgressRing'
export type { ProgressRingProps } from './ProgressRing/ProgressRing'

export { EmptyState } from './EmptyState/EmptyState'
export type { EmptyStateProps } from './EmptyState/EmptyState'

export { ErrorState } from './ErrorState/ErrorState'
export type { ErrorStateProps } from './ErrorState/ErrorState'

// ----- Fantasy domain patterns -----
export { Avatar } from './Avatar/Avatar'
export type { AvatarProps } from './Avatar/Avatar'

export { Crest } from './Crest/Crest'
export type { CrestProps } from './Crest/Crest'

export { PositionPill } from './PositionPill/PositionPill'
export type { PositionPillProps, PositionCode } from './PositionPill/PositionPill'

export { StencilNum } from './StencilNum/StencilNum'
export type { StencilNumProps } from './StencilNum/StencilNum'

export { Sparkline } from './Sparkline/Sparkline'
export type { SparklineProps } from './Sparkline/Sparkline'

export { PitchLines } from './PitchLines/PitchLines'
export type { PitchLinesProps } from './PitchLines/PitchLines'

export { Halftone } from './Halftone/Halftone'
export type { HalftoneProps } from './Halftone/Halftone'

export { DeadlineCountdown } from './DeadlineCountdown/DeadlineCountdown'
export type {
  DeadlineCountdownProps,
  DeadlineTone,
  DeadlineThresholds,
} from './DeadlineCountdown/DeadlineCountdown'

export { LiveChip } from './LivePoints/LiveChip'
export type { LiveChipProps, LiveStatus } from './LivePoints/LiveChip'

export { LivePoints } from './LivePoints/LivePoints'
export type { LivePointsProps } from './LivePoints/LivePoints'

export { BudgetMeter } from './BudgetMeter/BudgetMeter'
export type { BudgetMeterProps } from './BudgetMeter/BudgetMeter'

export { CaptainBadge } from './CaptainBadge/CaptainBadge'
export type { CaptainBadgeProps, CaptainRole } from './CaptainBadge/CaptainBadge'

export { FixtureDifficulty } from './FixtureDifficulty/FixtureDifficulty'
export type {
  FixtureDifficultyProps,
  Fixture,
  DifficultyLevel,
} from './FixtureDifficulty/FixtureDifficulty'

export { FixtureCard } from './FixtureCard/FixtureCard'
export type {
  FixtureCardProps,
  FixtureStatus,
  FixtureTeam,
} from './FixtureCard/FixtureCard'

export { LeagueStandings } from './LeagueStandings/LeagueStandings'
export type {
  LeagueStandingsProps,
  StandingRow,
  FormResult,
} from './LeagueStandings/LeagueStandings'

// ----- Part C — screen patterns -----
export { RoundSelector } from './RoundSelector/RoundSelector'
export type { RoundSelectorProps } from './RoundSelector/RoundSelector'

export { SubHead } from './SubHead/SubHead'
export type { SubHeadProps } from './SubHead/SubHead'

export { PlayersFilters } from './PlayersFilters/PlayersFilters'
export type {
  PlayersFiltersProps,
  SegmentedOption,
} from './PlayersFilters/PlayersFilters'

export { ActionCell } from './ActionCell/ActionCell'
export type { ActionCellProps, ActionKind } from './ActionCell/ActionCell'

export { PlayersCard } from './PlayersCard/PlayersCard'
export type { PlayersCardProps } from './PlayersCard/PlayersCard'

export { ResultsBar } from './ResultsBar/ResultsBar'
export type { ResultsBarProps } from './ResultsBar/ResultsBar'

export { PlayersTableApp } from './PlayersTableApp/PlayersTableApp'
export type {
  PlayersTableAppProps,
  PlayerRow,
  PlayerRowAction,
  PosTagCode,
} from './PlayersTableApp/PlayersTableApp'

export { useBreakpoint } from './PlayersTableApp/useBreakpoint'
export type { Breakpoint } from './PlayersTableApp/useBreakpoint'
