/**
 * Internationalization (i18n) utilities.
 * Provides browser-language detection, translation lookup, and DOM application.
 * Depends on: window.WorkHours being defined (constants.js).
 */
(function (W) {
  'use strict';

  var translations = {
    en: {
      app: {
        title: 'Working Hours Tracker'
      },
      theme: {
        label: 'Theme',
        selectAria: 'Select application theme',
        indonesia: 'Indonesia',
        dark: 'Dark mode',
        germany: 'Germany',
        ukraine: 'Ukraine',
        france: 'France',
        poland: 'Poland',
        us: 'United States',
        eu: 'European Union',
        japan: 'Japan',
        brazil: 'Brazil',
        china: 'China',
        india: 'India',
        mexico: 'Mexico',
        southafrica: 'South Africa',
        canada: 'Canada',
        uk: 'United Kingdom',
        argentina: 'Argentina',
        australia: 'Australia',
        russia: 'Russia',
        saudiarabia: 'Saudi Arabia',
        southkorea: 'South Korea',
        turkey: 'Turkey',
        spain: 'Spain',
        italy: 'Italy',
        netherlands: 'Netherlands',
        belgium: 'Belgium',
        sweden: 'Sweden',
        norway: 'Norway',
        finland: 'Finland',
        denmark: 'Denmark',
        switzerland: 'Switzerland',
        austria: 'Austria',
        ireland: 'Ireland',
        portugal: 'Portugal',
        czechia: 'Czechia',
        greece: 'Greece'
      },
      layout: {
        category1: '1. Profile, clock & entry',
        category2: '2. Filters & entries',
        category3: '3. Calendar & statistics'
      },
      profile: {
        title: 'Profile',
        selectLabel: 'Select profile',
        roleLabel: 'Role',
        rolePlaceholder: 'e.g. Developer, Manager',
        vacationDays: {
          title: 'Vacation days — view or change the annual vacation allowance for this profile.',
          aria: 'Vacation days – view or change the annual vacation allowance for this profile'
        },
        edit: {
          title: 'Edit profile — rename the current profile or update its role.',
          aria: 'Edit profile – rename the current profile or update its role'
        },
        add: {
          title: 'Add profile — create a new profile with its own entries and role.',
          aria: 'Add profile – create a new profile'
        },
        delete: {
          title: 'Delete profile — remove this profile and all of its stored entries.',
          aria: 'Delete profile – remove this profile and all of its stored entries'
        },
        saveData: {
          title: 'Save all profiles and entries to a JSON file named "Working Hours Data".',
          aria: 'Save all data to JSON file'
        },
        syncData: {
          title: 'Sync and merge data from a "Working Hours Data" JSON file.',
          aria: 'Sync data from JSON file'
        },
        language: {
          label: 'Language',
          auto: 'Auto',
          english: 'English',
          indonesian: 'Bahasa Indonesia',
          german: 'German',
          ukrainian: 'Ukrainian',
          french: 'French',
          polish: 'Polish',
          spanish: 'Spanish',
          italian: 'Italian',
          dutch: 'Dutch',
          swedish: 'Swedish',
          norwegian: 'Norwegian',
          finnish: 'Finnish',
          danish: 'Danish',
          portuguese: 'Portuguese',
          czech: 'Czech',
          greek: 'Greek',
          japanese: 'Japanese',
          brazilianPortuguese: 'Brazilian Portuguese',
          chinese: 'Chinese',
          hindi: 'Hindi',
          russian: 'Russian',
          arabic: 'Arabic',
          korean: 'Korean',
          turkish: 'Turkish',
          afrikaans: 'Afrikaans',
          manualPackPending: ' (manual pack not ready)',
          rolloutLocked: ' (rollout phase locked)',
          rolloutGroup: {
            g3: 'G3',
            g5: 'G5',
            g10: 'G10',
            g20: 'G20',
            all: 'All'
          }
        },
        actionsGroup: {
          crudTitle: 'Actions',
          dataTitle: 'Data'
        },
        prewarmUiPack: {
          button: 'Pre-cache all language packs',
          hint: 'Uses the network once to fill the translation cache for every language. Partial progress is saved; safe to repeat after app updates.',
          title: 'Download and cache translated UI strings for all languages (may take several minutes).',
          aria: 'Pre-cache translations for all languages',
          running: 'Caching translations for all languages…',
          done: 'Translation cache updated for all languages.',
          error: 'Caching did not finish. Partial progress is saved — you can try again.'
        }
      },
      clockEntry: {
        title: 'Clock & entry',
        dateLabel: 'Date',
        clockInLabel: 'Clock In',
        clockOutLabel: 'Clock Out',
        breakLabel: 'Break',
        breakUnitMinutes: 'Min',
        breakUnitHours: 'Hrs',
        statusLabel: 'Day status',
        locationLabel: 'Location',
        descriptionLabel: 'Description',
        timezoneLabel: 'Timezone',
        timezoneSearchPlaceholder: 'Search timezone...',
        timezoneSearchAriaLabel: 'Search timezone',
        timezoneHint: 'Times are stored in this timezone. Default: Germany, Berlin.',
        optionalNotesPlaceholder: 'Optional notes',
        optionalNotesTitle: 'Optional notes or context about this entry.',
        saveEntry: 'Save entry',
        saveEntryTitle: 'Save this entry for the selected date and times.',
        voiceEntryBtn: {
          text: 'Voice entry',
          title: 'Fill fields using voice. You can review in the popup before applying.',
          aria: 'Fill with voice'
        },
        setClockInNowTitle: 'Set Clock In to the current time.',
        setClockInNowAria: 'Set Clock In to the current time',
        setClockOutNowTitle: 'Set Clock Out to the current time.',
        setClockOutNowAria: 'Set Clock Out to the current time'
      },
      filtersEntries: {
        title: 'Filters & entries',
        basicMode: 'Basic',
        advancedMode: 'Advanced',
        showAllDates: 'Show all dates',
        showUpToCurrentDate: 'Only up to current date',
        showAllDatesHint: 'When unchecked, only entries up to today are shown. When checked, future entries are included.',
        resetFilters: 'Reset filters',
        resetSelection: 'Reset selection',
        viewTimesIn: 'View times in',
        entriesViewTimezonePlaceholder: 'Entry timezone',
        entriesViewTimezoneAriaLabel: 'View times in timezone',
        entriesSelectAllAriaLabel: 'Select all visible entries',
        entriesSelectSrOnly: 'Select',
        searchPlaceholder: 'Search date, status, location, description...',
        searchAriaLabel: 'Search entries',
        searchClear: 'Clear search',
        searchSuggestionsLabel: 'Suggestions',
        searchNoMatch: 'No entries match. Try a different search.',
        fullscreenBtnEnter: 'Full screen',
        fullscreenBtnExit: 'Exit full screen',
        fullscreenBtnTitleEnter: 'View entries list in full screen',
        fullscreenBtnTitleExit: 'Exit full screen',
        emptyState: 'No entries yet. Clock in or add an entry on the left.',
        editBtn: 'Edit',
        deleteBtn: 'Delete',
        infographicBtn: 'Infographic',
        statsSummaryBtn: 'Statistics summary',
        keyHighlightsPptBtn: 'Key highlights (PPT)',
        keyHighlightsPptBtnTitle: 'Generate PowerPoint with key highlights (work, vacation, holiday, sick) per year',
        /** Shown in the entries toolbar when two or more rows are selected ({count}). */
        entriesSelectedSummaryMany: '{count} entries selected',
        columns: {
          date: 'Date',
          time: 'Time',
          duration: 'Duration',
          status: 'Status',
          location: 'Location',
          description: 'Description',
          descriptionHoverTitle: 'Description (hover for details)'
        },
        sortBy: {
          date: 'Sort by date',
          duration: 'Sort by duration',
          status: 'Sort by status',
          location: 'Sort by location'
        }
      },
      calendarStats: {
        categoryLabel: '3. Calendar & statistics',
        calendarTitle: 'Calendar',
        prevMonthAria: 'Previous month',
        nextMonthAria: 'Next month',
        legendDayStatus: 'Day status:',
        legendLocation: 'Location:',
        legendWork: 'Work',
        legendSick: 'Sick',
        legendHoliday: 'Holiday',
        legendVacation: 'Vacation',
        legendWFH: 'Home',
        legendWFO: 'Office',
        legendAnywhere: 'Anywhere',
        statsTitle: 'Statistics',
        months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
        weekdaysShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
        ,
        // Full weekday names for UI labels (filters, calendar headers, charts).
        // Keep `weekdaysShort` as-is so PPT export can still use abbreviations.
        weekdaysFull: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
      },
      status: {
        work: 'Work',
        sick: 'Sick',
        holiday: 'Holiday',
        vacation: 'Vacation'
      },
      location: {
        anywhere: 'Anywhere',
        wfo: 'Office',
        wfh: 'Home'
      },
      time: {
        hour: 'hour',
        hours: 'hours',
        minute: 'minute',
        minutes: 'minutes'
      },
      filters: {
        year: 'Year',
        month: 'Month',
        day: 'Day',
        week: 'Week',
        dayName: 'Day name',
        overtime: 'Overtime',
        duration: 'Duration',
        description: 'Description',
        options: {
          duration: {
            'has-duration': 'Has duration',
            'no-duration': 'No duration'
          },
          overtime: {
            overtime: 'Overtime',
            'no-overtime': 'No Overtime'
          },
          description: {
            available: 'Available',
            'not-available': 'Not Available'
          }
        }
      },
      render: {
        selectRowAria: 'Select row',
        descriptionAria: 'Description',
        noDescriptionAria: 'No description',
        originalTimezoneLabel: 'Original timezone',
        convertedTimezoneLabel: 'Converted timezone',
        clockInOutRangeLabel: 'Clock In – Clock Out',
        nextDaySuffix: '(+1 day)',
        dateLabel: 'Date',
        workingHoursLabel: 'Working hours',
        breakLabel: 'Break',
        overtimeLabel: 'Overtime',
        overtimeBadgeTitle: 'Overtime',
        otSuffix: 'OT',
        locationAnywhereLabel: 'Anywhere',
        durationWorkingHours: 'Working hours: {dur}',
        durationBreak: 'Break: {break}',
        durationOvertime: 'Overtime: +{ot}'
      },
      statsSummary: {
        quarterPrefix: 'Q',
        weekPrefix: 'W',
        /** ISO week number + year (replaces raw "W50 2025" style in UI). */
        weekLabel: 'Week {week}, {year}',
        chartWorkingHours: 'Working hours',
        chartOvertime: 'Overtime',
        chartAvgWork: 'Avg working hours (per work day)',
        chartAvgOvertime: 'Avg overtime (per work day)',
        fullscreenBarWork: 'Working hours (total per period)',
        fullscreenLineOvertime: 'Overtime (total per period)',
        fullscreenBarAvgWork: 'Average working hours (per work day in period)',
        fullscreenLineAvgOvertime: 'Average overtime (per work day in period)',
        datasetWfo: 'Office (WFO)',
        datasetWfh: 'Home (WFH)',
        detailTotalWorkTitle: 'Total working hours (WFO & WFH)',
        detailAvgWorkTitle: 'Average working hours per day (WFO & WFH)',
        detailTotalOvertimeTitle: 'Total overtime (WFO & WFH)',
        detailAvgOvertimeTitle: 'Average overtime per day (WFO & WFH)',
        fullscreenDetailTotalWork: 'Total working hours by location (WFO vs WFH)',
        fullscreenDetailAvgWork: 'Average working hours by location (WFO vs WFH)',
        fullscreenDetailTotalOvertime: 'Total overtime by location (WFO vs WFH)',
        fullscreenDetailAvgOvertime: 'Average overtime by location (WFO vs WFH)',
        box: {
          totalWorkingHours: 'Total working hours',
          avgPerWorkDay: 'Avg per work day',
          totalOvertime: 'Total overtime',
          avgOvertime: 'Avg overtime',
          daysByType: 'Days by type',
          workDays: 'Work days',
          vacationDays: 'Vacation',
          holidayDays: 'Holiday',
          sickDays: 'Sick'
        }
      },
      infographic: {
        exportCsv: 'Export CSV',
        sectionSummaryTotals: 'Summary totals',
        sectionVacationDays: 'Vacation days',
        sectionVacationByWeekday: 'Vacation days used by weekday (Monday–Friday)',
        sectionTotalWorkByWeekday: 'Total working hours by weekday (Monday–Friday)',
        sectionAvgWorkByWeekday: 'Average working hours by weekday (Monday–Friday)',
        sectionTotalOvertimeByWeekday: 'Total overtime by weekday (Monday–Friday)',
        sectionAvgOvertimeByWeekday: 'Average overtime by weekday (Monday–Friday)',
        descSummaryTotals: 'Aggregated from entries matching the current filters (year, month, week, day, status, location).',
        descVacationDays: 'Quota (allowed per year) vs used (entries with status Vacation).',
        descVacationByWeekday: 'Number of vacation days used per weekday per year (status Vacation, weekdays only).',
        descTotalWorkByWeekday: 'Sum of working hours per weekday per year (status Work only).',
        descAvgWorkByWeekday: 'Average working hours per work day, per weekday per year (status Work only).',
        descTotalOvertimeByWeekday: 'Sum of overtime per weekday per year (status Work only).',
        descAvgOvertimeByWeekday: 'Average overtime per work day, per weekday per year (status Work only).',
        table: {
          metric: 'Metric',
          value: 'Value',
          year: 'Year',
          quota: 'Quota',
          used: 'Used',
          remaining: 'Remaining'
        },
        csv: {
          minutesSuffix: 'minutes',
          metricMinutesValue: '{day} (minutes)'
        },
        metrics: {
          totalWorkingHours: 'Total working hours',
          avgWorkingHours: 'Average working hours',
          totalOvertime: 'Total overtime',
          avgOvertime: 'Average overtime',
          totalVacationQuota: 'Total vacation quota',
          totalVacationUsed: 'Total vacation used',
          totalSick: 'Total sick',
          totalPublicHolidays: 'Total public holidays'
        }
      },
      modals: {
        editEntry: {
          title: 'Edit entry',
          titleWithBatch: 'Edit entry ({current} of {total})',
          dateLabel: 'Date',
          clockInLabel: 'Clock In',
          clockOutLabel: 'Clock Out',
          breakLabel: 'Break duration',
          breakMinutes: 'Minutes',
          breakHours: 'Hours',
          statusLabel: 'Day status',
          locationLabel: 'Location',
          timezoneLabel: 'Timezone',
          descriptionLabel: 'Description',
          optionalNotesPlaceholder: 'Optional notes (free text)',
          cancel: 'Cancel',
          saveChanges: 'Save changes',
          voiceEntryBtn: {
            text: 'Voice entry',
            title: 'Fill fields using voice. You can review in the popup before applying.',
            aria: 'Fill with voice'
          }
        },
        deleteEntry: {
          title: 'Delete entry',
          titleMany: 'Delete entries',
          message: 'Delete this entry? This action cannot be undone.',
          messageMany: 'Delete {count} selected entries? This action cannot be undone.',
          cancel: 'Cancel',
          delete: 'Delete'
        },
        exportData: {
          title: 'Export data',
          description: 'Export all data: every profile, vacation, and entry (including future dates), sorted by date ascending.',
          exportCsv: 'Export CSV',
          exportJson: 'Export JSON',
          csvHint: 'Spreadsheet-friendly',
          jsonHint: 'Structured data',
          closeAria: 'Close export'
        },
        voiceReview: {
          title: 'Review voice entry',
          description: 'Review the parsed information below. Click Apply to form to fill the clock entry form. You can edit any field before saving.',
          heardLabel: 'Heard',
          dateLabel: 'Date',
          clockInLabel: 'Clock in',
          clockOutLabel: 'Clock out',
          breakLabel: 'Break',
          breakUnitMinutes: 'Min',
          breakUnitHours: 'Hrs',
          statusLabel: 'Day status',
          locationLabel: 'Location',
          descriptionLabel: 'Description',
          optionalNotesPlaceholder: 'Optional notes',
          cancel: 'Cancel',
          apply: 'Apply to form',
          retake: {
            text: 'Voice entry',
            title: 'Listen again and replace with new voice input',
            aria: 'Retake voice'
          },
          closeAria: 'Close'
        },
        help: {
          title: 'Help',
          closeAria: 'Close help'
        },
        vacationDaysModal: {
          title: 'Vacation days per year',
          description: 'Set the number of vacation days allowed for each year. Data is saved per profile.',
          cancel: 'Cancel',
          save: 'Save'
        },
        newProfileModal: {
          title: 'Add profile',
          description: 'Create a new profile with its own entries and role.',
          profileNameLabel: 'Profile name',
          roleLabel: 'Role',
          profileNamePlaceholder: 'e.g. Alice, Team A',
          rolePlaceholder: 'e.g. Developer, Manager',
          cancel: 'Cancel',
          create: 'Create profile'
        },
        editProfileModal: {
          title: 'Edit profile',
          description: 'Change the profile name and role. Renaming keeps all entries and settings.',
          profileNameLabel: 'Profile name',
          roleLabel: 'Role',
          profileNamePlaceholder: 'e.g. Alice, Team A',
          rolePlaceholder: 'e.g. Developer, Manager',
          cancel: 'Cancel',
          save: 'Save changes'
        },
        deleteProfileModal: {
          title: 'Delete profile',
          description: 'Delete this profile? All entries, vacation settings, and data for this profile will be permanently removed. This cannot be undone.',
          cancel: 'Cancel',
          delete: 'Delete profile'
        },
        statsSummaryModal: {
          title: 'Statistics summary',
          description: 'Charts use the same filtered entries as the entries table and summary stats (year, month, week, day, status, location, advanced options, search, calendar selection, and “show all dates”). The period view groups that subset along the timeline. Use Date from / Date to below to pin an inclusive range for all charts; leave them empty and each view (weekly, monthly, quarterly, annually) spans every period from your oldest filtered entry through the latest entry, or through today if that is later. In Details, only office (WFO) and home (WFH) are split; other locations are omitted.',
          viewLabel: 'View',
          categoryGeneral: 'General',
          categoryDetails: 'Details',
          categoryGeneralTooltip: 'Overview charts: total and average hours and overtime by period',
          categoryDetailsTooltip: 'Line charts: WFO vs WFH over time for totals and averages',
          viewWeekly: 'Weekly',
          viewMonthly: 'Monthly',
          viewQuarterly: 'Quarterly',
          viewAnnually: 'Annually',
          dateFromLabel: 'Date from',
          dateToLabel: 'Date to',
          dateRangeHint: 'Optional: inclusive range for every chart. Empty: full span of periods from oldest to latest filtered entry (through today when later), except when filters or calendar selection narrow dates.',
          dateClear: 'Clear dates',
          fullScreen: 'Full screen',
          downloadImage: 'Download image',
          columnTotal: 'Total',
          columnAverage: 'Average',
          fullScreenTooltip: 'View chart full screen',
          downloadImageTooltip: 'Download chart as PNG',
          close: 'Close'
        },
        statsSummaryEnlargeModal: {
          title: 'Chart',
          downloadImage: 'Download image',
          close: 'Close',
          canvasAriaLabel: 'Enlarged chart',
          chartsNavAria: 'Switch chart without leaving full screen',
          prevChart: 'Previous',
          nextChart: 'Next',
          prevChartShows: 'Previous chart: {name}',
          nextChartShows: 'Next chart: {name}',
          navNoPrevious: 'First chart',
          navNoNext: 'Last chart'
        },
        infographicModal: {
          title: 'Infographic',
          close: 'Close'
        },
        keyHighlightsPptModal: {
          title: 'Key highlights – PowerPoint',
          subtitle: 'Configure slides and metrics for your export',
          description: 'Choose years and metrics to include. Each year can have days summary, hours summary, and optional trend slides.',
          closeAria: 'Close',
          cancel: 'Cancel',
          generatePowerPoint: 'Generate PowerPoint',
          yearsTitle: 'Years to include',
          yearsTriggerAria: 'Select years',
          yearsTriggerText: 'Select years...',
          selectAllYears: 'Select all',
          clearYears: 'Clear',
          metricsTitle: 'Metrics to include',
          daysGroupLabel: 'Days',
          workingDaysLabel: 'Working days',
          workingDaysHint: 'Office/Home',
          vacationDaysLabel: 'Vacation days',
          vacationQuotaLabel: 'Vacation quota',
          vacationRemainingLabel: 'Vacation remaining',
          sickLeaveLabel: 'Sick leave',
          holidaysLabel: 'Holidays',
          hoursOvertimeGroupLabel: 'Hours & overtime',
          workingHoursLabel: 'Working hours',
          workingHoursHint: 'total & avg',
          overtimeLabel: 'Overtime',
          overtimeHint: 'total & avg',
          trendTitle: 'Trend slides (x-axis)',
          trendHintBlock: 'Select one or more bases for historical trend slides. <strong>{none}</strong> means no trend slides.',
          trendNoneLabel: 'None',
          trendWeeklyLabel: 'Weekly',
          trendMonthlyLabel: 'Monthly',
          trendQuarterlyLabel: 'Quarterly',
          trendBasisHint: 'Each selected basis adds 2 slides per year (working hours trend + overtime trend) with min/max/median. If office vs home line trends are on, each basis adds extra slides per year with WFO vs WFH line charts (same periods).',
          wfoWfhTrendLabel: 'Office vs home line trends',
          wfoWfhTrendHint: 'WFO/WFH by period (needs a trend basis)'
        }
      },
      toolbar: {
        importCsvLabel: 'Import CSV',
        importCsvTitle: 'Import from CSV file',
        importJsonLabel: 'Import JSON',
        importJsonTitle: 'Import from JSON file',
        exportCsvLabel: 'Export CSV',
        exportCsvTitle: 'Export all data as CSV',
        exportJsonLabel: 'Export JSON',
        exportJsonTitle: 'Export all data as JSON'
      },
      common: {
        all: 'All',
        saving: 'Saving…',
        saved: 'Saved',
        profileLabel: 'profile',
        profilesLabel: 'profiles',
        helpBtnAria: 'Help',
        internetStatus: {
          label: 'Internet status',
          on: 'Internet is on',
          off: 'Internet is offline'
        }
      },
      timezone: {
        suggestions: 'Suggestions',
        typeToNarrow: 'Type to narrow down ({n} total)',
        noMatch: 'No timezones match. Try a different search.',
        optionsAriaLabel: 'Timezone options',
        displayLabels: {
          Europe_Berlin: 'Germany, Berlin',
          UTC: 'UTC'
        },
        /**
         * Human-friendly translations for the IANA "region" segment that appears
         * inside many timezone IDs (e.g. "Africa/Cairo" -> segment "Africa").
         *
         * These are used only for display purposes.
         */
        regionNames: {
          Africa: 'Africa',
          America: 'America',
          Antarctica: 'Antarctica',
          Arctic: 'Arctic',
          Asia: 'Asia',
          Atlantic: 'Atlantic',
          Australia: 'Australia',
          Europe: 'Europe',
          Indian: 'Indian Ocean',
          Pacific: 'Pacific',
          UTC: 'UTC'
        }
      },
      ppt: {
        noEntries: 'No entries found. Add entries first.',
        noYears: 'No years available',
        selectYears: 'Select years...',
        allYears: 'All years ({n})',
        pptxRequired: 'PowerPoint export requires PptxGenJS. Run npm install and load the app from a server.'
      },
      pptExport: {
        keyHighlightsTitle: 'Key Highlights',
        keyHighlightsSubtitle: 'Working days · Vacation · Sick · Holidays · Hours & Overtime',
        generated: 'Generated',
        daysSummaryTitle: 'Days summary',
        workingHoursSummaryTitle: 'Working hours & Overtime',

        metric: 'Metric',
        value: 'Value',
        workingDaysTotal: 'Working days (total)',
        workWfo: '  — Office',
        workWfh: '  — Home',
        vacationDays: 'Vacation days',
        vacationQuota: 'Vacation days quota',
        vacationRemaining: 'Vacation days remaining',
        sickLeave: 'Sick leave',
        holidays: 'Holidays',

        totalWorkingHours: 'Total working hours',
        avgWorkHoursPerWorkDay: 'Avg working hours (per work day)',
        totalOvertime: 'Total overtime',
        avgOvertimePerWorkDay: 'Avg overtime (per work day)',

        seriesWorkingHours: 'Working hours',
        seriesOvertime: 'Overtime',
        chartLabelTotal: 'Total',
        chartLabelAvgPerWorkDay: 'Avg per work day',

        chartTitleTotalWorkingHoursHours: 'Total working hours (hours)',
        chartTitleAvgWorkingHoursPerWorkDay: 'Average working hours (per work day)',
        chartTitleTotalOvertimeHours: 'Total overtime (hours)',
        chartTitleAvgOvertimePerWorkDay: 'Average overtime (per work day)',

        workingHoursTrendTitle: 'Working hours trend ({basis})',
        overtimeTrendTitle: 'Overtime trend ({basis})',

        minLabel: 'Minimum:',
        maxLabel: 'Maximum:',
        medianLabel: 'Median:',

        totalWorkingHoursByPeriod: 'Total working hours by {basis}',
        avgWorkingHoursByPeriod: 'Average working hours (per work day) by {basis}',
        totalOvertimeByPeriod: 'Total overtime by {basis}',
        avgOvertimeByPeriod: 'Average overtime (per work day) by {basis}',

        wfoWfhWorkingHoursTrendTitle: 'Working hours — office vs home ({basis})',
        wfoWfhOvertimeTrendTitle: 'Overtime — office vs home ({basis})',
        wfoWfhTotalWorkByPeriod: 'Total working hours — WFO vs WFH by {basis}',
        wfoWfhAvgWorkByPeriod: 'Average working hours (per work day) — WFO vs WFH by {basis}',
        wfoWfhTotalOvertimeByPeriod: 'Total overtime — WFO vs WFH by {basis}',
        wfoWfhAvgOvertimeByPeriod: 'Average overtime (per work day) — WFO vs WFH by {basis}',

        trendSeriesTotal: 'Total',
        trendSeriesAvg: 'Average',
        /** Value (Y) axis on PPT charts — values are hours as decimals. */
        chartAxisValueTitle: 'Hours',
        /** When median falls between two periods, join their labels. */
        medianPeriodSeparator: ' / '
      },
      clock: {
        statusClockedIn: 'Clocked in at {time} for {date}. You can adjust times manually, then click Save entry.',
        statusClockOutSet: 'Clock out time set for {date}. You can adjust times manually, then click Save entry to store.'
      },
      form: {
        locationFixedTitle: 'Location is fixed to Anywhere for {status} days.',
        locationWorkTitle: 'Work location: office (WFO) or home (WFH) only.',
        clockFixedNonWorkTitle: 'Clock in (09:00) and clock out (18:00) are fixed for sick, holiday, and vacation days.',
        breakFixedNonWorkTitle: 'Break is fixed to 1 hour for sick, holiday, and vacation days.'
      },
      vacationDays: {
        ariaLabel: 'Vacation days {year}'
      },
      export: {
        toastMessage: 'Exported {entries} entries across {profiles} {profileLabel} as {format} in {duration} s.'
      },
      import: {
        toastMessage: 'Imported {imported} entries across {profiles} {profileLabel} from "{filename}" ({format}) in {duration} s.'
      },
      sync: {
        saving: 'Saving…',
        saved: 'Saved',
        savedToast: 'Saved {entries} entries across {profiles} {profileLabel} to data/Working Hours Data.json.',
        cannotSaveFetch: 'Cannot save: fetch API is not available in this browser.',
        saveFailedStatus: 'Failed to save data to server (status {status}). Ensure backend is running: npm start',
        saveFailedConnect: 'Save failed. Open the app from http://localhost:3011 (with backend running on 3010) or http://localhost:3010.',
        syncFailedInvalid: 'Failed to sync data: invalid JSON.',
        syncFailedFormat: 'Failed to sync data: JSON format not recognized.',
        syncedFromFile: 'Synced data from "{filename}".',
        syncFailedRead: 'Failed to read "Working Hours Data" file.',
        syncChooseFile: 'Sync via server is not available; please choose a "Working Hours Data" JSON file.',
        syncFailedServerFormat: 'Failed to sync data from server: JSON format not recognized.',
        syncedFromServer: 'Synced data from data/Working Hours Data.json via server.',
        noServerCopy: 'No server copy found. Please save once or choose a "Working Hours Data" JSON file.'
      },
      toasts: {
        selectOneYear: 'Select at least one year.',
        selectOneMetric: 'Select at least one metric to include.',
        pptWfoWfhNeedsTrend: 'Office vs home line trends need at least one trend basis (weekly, monthly, or quarterly).',
        pptWfoWfhNeedsHours: 'Turn on Working hours and/or Overtime to include office vs home line trends.',
        pptDownloaded: 'Key highlights PowerPoint downloaded.',
        pptDownloadFailed: 'Download failed: {msg}',
        pptFailed: 'PPT generation failed: {msg}',
        cannotDeleteOnlyProfile: 'Cannot delete the only profile. Create another profile first.',
        editFormUpdated: 'Edit form updated. Review and click Save changes when ready.',
        entryFormUpdated: 'Entry form updated. Review and click Save entry when ready.',
        voiceNotSupported: 'Voice input is not supported in this browser. Try Chrome or Edge.',
        listeningRetake: 'Listening… Say your entry again. You have up to 1 minute.',
        listeningFromEntry: 'Listening… Date is taken from the entry. Say times, break, location, etc. (e.g. "9 to 5, one hour break, WFH").',
        listeningGeneric: 'Listening… You have up to 1 minute to speak. Say your entry (e.g. "Today 9 to 5, 30 min break, WFH, meeting with client").',
        voiceInputFailed: 'Voice input failed. Try again or type manually.',
        voiceMicrophoneDenied: 'Microphone access denied. Allow microphone to use voice entry.',
        voiceNoSpeechDetected: 'No speech detected. You have up to 1 minute to speak—try again.',
        noSpeechDetected: 'No speech detected for 1 minute. Try again or type your entry manually.',
        couldNotStartVoice: 'Could not start voice recognition.',
        importRowsIssues: 'Some rows had issues: {errors}',
        pleaseSelectDate: 'Please select a date.',
        pleaseChooseCsv: 'Please choose a CSV file',
        pleaseChooseJson: 'Please choose a JSON file',
        enterProfileName: 'Enter a profile name.',
        profileNameReservedOrUsed: 'Profile name reserved or already in use.',
        profileNameReserved: 'Profile name reserved.'
      }
      ,voice: {
        listeningAria: 'Listening…'
      }
    }
  };

  /** Help content (long-form) for help modal — English only; other locales ship in `js/i18n-*-locale.js`. */
  var helpEn = {
    profile: { title: 'Profile', body: 'Switch between profiles using the dropdown. Each profile has its own entries and settings, stored locally in your browser.\n\nRole is shown for the selected profile and can only be changed via Edit profile.\n\n• Edit profile — change the current profile\'s name and role.\n\n• Add profile — create a new profile.\n\n• Vacation days — set annual allowance for the current profile.\n\n• Delete profile — remove the current profile and all its data. You must have at least one profile.' },
    clockEntry: { title: 'Clock & entry', body: 'This section combines quick clock and manual entry in one form. All times are stored in the selected Timezone (default: Germany, Berlin).\n\nQuick clock: Select the date below, then use Clock In or Clock Out. The form is filled with the current time; you can adjust Clock In or Clock Out manually before saving. Click Save entry to store the entry. No entry is created until you click Save entry.\n\nManual entry: Enter date, Clock In, Clock Out, Break (duration = Clock Out − Clock In − Break), Day status (work, sick, holiday, vacation), Location (WFO, WFH, Anywhere), Timezone (default Germany, Berlin), and optional Description. Click Save entry to add or update.\n\nFor non-work days (sick, holiday, vacation), clock in (09:00), clock out (18:00), location (Anywhere), and break (1 hour) are set automatically; those fields cannot be edited until you switch back to Work.' },
    filtersEntries: { title: 'Filters & entries', body: 'Filters (Basic / Advanced)\n\nUse Basic to show Year, Month, Day status, Location, and Duration. Switch to Advanced for Week, Day name, Day number, Overtime, and Description filters. Choose "All" in any dropdown to show everything. The calendar and statistics respect these filters.\n\n• Show all dates — when unchecked (default), only entries on or before today are shown; when checked, future entries are included.\n\n• Reset filters — set all filter dropdowns to "All".\n\n• Reset selection — clear selected rows in the table.\n\n• View times in — choose which timezone to use for displaying Date, Clock In, and Clock Out in the table. Select "Entry timezone" to show each entry in its own timezone, or pick any global timezone (searchable list). Date and times are converted to the selected view timezone.\n\nEntries table\n\nSelect rows with the checkbox; use Edit to open the edit form, Delete to remove selected entries (with confirmation). The Timezone column shows the timezone for each entry (default: Germany, Berlin). Use "View times in" to display date and times in another timezone; the list is searchable.\n\n• Export — download entries as CSV or JSON (uses current filters).\n\n• Import — merge data from CSV or JSON.\n\n• Infographic / Statistics summary — view reports.\n\nKey highlights (PowerPoint)\n\nOpens a modal where you configure slides and metrics for your export. Section 1: choose which years to include from a dropdown. Section 2: select metrics in two groups — Days (working days with WFO/WFH, vacation days, vacation quota, vacation remaining, sick leave, holidays) and Hours & overtime (working hours, overtime). Section 3: choose trend slides (x-axis) — None, or one or more of Weekly, Monthly, Quarterly. None is exclusive; you can select multiple bases for trend slides. Click Generate PowerPoint to build and download the file. The deck includes a title slide and, per year: days summary (including vacation quota and remaining when set), hours and overtime summary, and for each selected trend basis two slides (working hours trend and overtime trend) with min/max/median highlights per chart.' },
    filters: { title: 'Filters', body: 'Filter the entries list and calendar by Year, Month, Week, Day name, Day status (work, sick, holiday, vacation), Location (WFO, WFH, Anywhere), Overtime, Description, and Duration. Use Basic for main filters; switch to Advanced for more options. Choose "All" to show everything. The calendar and statistics sections respect these filters.' },
    entries: { title: 'Entries', body: 'Table of entries matching the current filters. Select rows with the checkbox, then Edit or Delete. Use Export to download CSV or JSON. Row colors show day status; location icons show WFH, WFO, or Anywhere.' },
    calendar: { title: 'Calendar', body: 'Month view of your entries. Cells are colored by day status (work, sick, holiday, vacation).\n\n• Location dots: one = WFH, two = WFO, three = Anywhere.\n\nUse the arrows to change month. The calendar aligns with the filters year and month. If both are "All", it shows the current month.' },
    statistics: { title: 'Statistics', body: 'Summary of the filtered entries:\n\n• Total working hours and overtime.\n\n• Average per work day and average overtime.\n\n• Days by type (work, vacation, holiday, sick).\n\nAll values are computed from entries that match the current filters.' }
  };
  translations.en.help = helpEn;


  /** Deep clone for locale pack seeding (structural parity with English). */
  function i18nCloneDeep(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  /** Full manual Indonesian pack (`js/i18n-id-locale.js` must load before `i18n.js`). */
  if (typeof window !== 'undefined' && window.__WH_TRANSLATIONS_ID) {
    translations.id = i18nCloneDeep(window.__WH_TRANSLATIONS_ID);
  }

  /** Volledige handmatige Afrikaanse pakket (`js/i18n-af-locale.js` moet voor `i18n.js` gelaai word). */
  if (typeof window !== 'undefined' && window.__WH_TRANSLATIONS_AF) {
    translations.af = i18nCloneDeep(window.__WH_TRANSLATIONS_AF);
  }

  /** Full manual Arabic pack (`js/i18n-ar-locale.js` must load before `i18n.js`, after `i18n-af-locale.js`). */
  if (typeof window !== 'undefined' && window.__WH_TRANSLATIONS_AR) {
    translations.ar = i18nCloneDeep(window.__WH_TRANSLATIONS_AR);
  }

  /** Pacote manual pt-BR (`js/i18n-pt-br-locale.js` antes de `i18n.js`, após os outros locais manuais). */
  if (typeof window !== 'undefined' && window.__WH_TRANSLATIONS_PT_BR) {
    translations['pt-BR'] = i18nCloneDeep(window.__WH_TRANSLATIONS_PT_BR);
  }

  /** 简体中文完整包（`js/i18n-zh-locale.js` 在 `i18n.js` 之前加载）。 */
  if (typeof window !== 'undefined' && window.__WH_TRANSLATIONS_ZH) {
    translations.zh = i18nCloneDeep(window.__WH_TRANSLATIONS_ZH);
  }

  /** Úplný český balíček (`js/i18n-cs-locale.js` před `i18n.js`, po ostatních ručních locale). */
  if (typeof window !== 'undefined' && window.__WH_TRANSLATIONS_CS) {
    translations.cs = i18nCloneDeep(window.__WH_TRANSLATIONS_CS);
  }

  /** Fuld dansk pakke (`js/i18n-da-locale.js` før `i18n.js`, efter øvrige manuelle locale-filer). */
  if (typeof window !== 'undefined' && window.__WH_TRANSLATIONS_DA) {
    translations.da = i18nCloneDeep(window.__WH_TRANSLATIONS_DA);
  }

  /** Volledig Nederlands pakket (`js/i18n-nl-locale.js` vóór `i18n.js`, na andere handmatige locale-bestanden). */
  if (typeof window !== 'undefined' && window.__WH_TRANSLATIONS_NL) {
    translations.nl = i18nCloneDeep(window.__WH_TRANSLATIONS_NL);
  }

  /** Täysi suomenkielinen paketti (`js/i18n-fi-locale.js` ennen `i18n.js`, muiden manuaalisten locale-tiedostojen jälkeen). */
  if (typeof window !== 'undefined' && window.__WH_TRANSLATIONS_FI) {
    translations.fi = i18nCloneDeep(window.__WH_TRANSLATIONS_FI);
  }

  /** Täysi italiankielinen paketti (`js/i18n-it-locale.js` ennen `i18n.js`). */
  if (typeof window !== 'undefined' && window.__WH_TRANSLATIONS_IT) {
    translations.it = i18nCloneDeep(window.__WH_TRANSLATIONS_IT);
  }

  /** Täysi hindinkielinen paketti (`js/i18n-hi-locale.js` ennen `i18n.js`). */
  if (typeof window !== 'undefined' && window.__WH_TRANSLATIONS_HI) {
    translations.hi = i18nCloneDeep(window.__WH_TRANSLATIONS_HI);
  }

  /** Täysi japaninkielinen paketti (`js/i18n-ja-locale.js` ennen `i18n.js`). */
  if (typeof window !== 'undefined' && window.__WH_TRANSLATIONS_JA) {
    translations.ja = i18nCloneDeep(window.__WH_TRANSLATIONS_JA);
  }

  /** Täysi koreaninkielinen paketti (`js/i18n-ko-locale.js` ennen `i18n.js`). */
  if (typeof window !== 'undefined' && window.__WH_TRANSLATIONS_KO) {
    translations.ko = i18nCloneDeep(window.__WH_TRANSLATIONS_KO);
  }

  /** Täysi norjankielinen paketti (`js/i18n-no-locale.js` ennen `i18n.js`). */
  if (typeof window !== 'undefined' && window.__WH_TRANSLATIONS_NO) {
    translations.no = i18nCloneDeep(window.__WH_TRANSLATIONS_NO);
  }

  /** Täysi puolankielinen paketti (`js/i18n-pl-locale.js` ennen `i18n.js`). */
  if (typeof window !== 'undefined' && window.__WH_TRANSLATIONS_PL) {
    translations.pl = i18nCloneDeep(window.__WH_TRANSLATIONS_PL);
  }

  /** Täysi portugalinkielinen paketti (`js/i18n-pt-locale.js` ennen `i18n.js`). */
  if (typeof window !== 'undefined' && window.__WH_TRANSLATIONS_PT) {
    translations.pt = i18nCloneDeep(window.__WH_TRANSLATIONS_PT);
  }

  /** Täysi venäjänkielinen paketti (`js/i18n-ru-locale.js` ennen `i18n.js`). */
  if (typeof window !== 'undefined' && window.__WH_TRANSLATIONS_RU) {
    translations.ru = i18nCloneDeep(window.__WH_TRANSLATIONS_RU);
  }

  /** Täysi espanjankielinen paketti (`js/i18n-es-locale.js` ennen `i18n.js`). */
  if (typeof window !== 'undefined' && window.__WH_TRANSLATIONS_ES) {
    translations.es = i18nCloneDeep(window.__WH_TRANSLATIONS_ES);
  }

  /** Täysi ruotsinkielinen paketti (`js/i18n-sv-locale.js` ennen `i18n.js`). */
  if (typeof window !== 'undefined' && window.__WH_TRANSLATIONS_SV) {
    translations.sv = i18nCloneDeep(window.__WH_TRANSLATIONS_SV);
  }

  /** Täysi turkinkielinen paketti (`js/i18n-tr-locale.js` ennen `i18n.js`). */
  if (typeof window !== 'undefined' && window.__WH_TRANSLATIONS_TR) {
    translations.tr = i18nCloneDeep(window.__WH_TRANSLATIONS_TR);
  }

  /** Täysi ukrainankielinen paketti (`js/i18n-uk-locale.js` ennen `i18n.js`). */
  if (typeof window !== 'undefined' && window.__WH_TRANSLATIONS_UK) {
    translations.uk = i18nCloneDeep(window.__WH_TRANSLATIONS_UK);
  }

  /** Täysi manuaalinen saksankielinen paketti (`js/i18n-de-locale.js` before `i18n.js`). */
  if (typeof window !== 'undefined' && window.__WH_TRANSLATIONS_DE) {
    translations.de = i18nCloneDeep(window.__WH_TRANSLATIONS_DE);
  }

  /** Täysi manuaalinen ranskankielinen paketti (`js/i18n-fr-locale.js` before `i18n.js`). */
  if (typeof window !== 'undefined' && window.__WH_TRANSLATIONS_FR) {
    translations.fr = i18nCloneDeep(window.__WH_TRANSLATIONS_FR);
  }

  /** Täysi manuaalinen kreikankielinen paketti (`js/i18n-el-locale.js` before `i18n.js`). */
  if (typeof window !== 'undefined' && window.__WH_TRANSLATIONS_EL) {
    translations.el = i18nCloneDeep(window.__WH_TRANSLATIONS_EL);
  }

  /** Maps profile.language.* property names to BCP47 codes for Intl.DisplayNames. */
  var PROFILE_LANG_KEYS_TO_BCP47 = {
    english: 'en',
    indonesian: 'id',
    german: 'de',
    ukrainian: 'uk',
    french: 'fr',
    polish: 'pl',
    spanish: 'es',
    italian: 'it',
    dutch: 'nl',
    swedish: 'sv',
    norwegian: 'nb',
    finnish: 'fi',
    danish: 'da',
    portuguese: 'pt',
    czech: 'cs',
    greek: 'el',
    japanese: 'ja',
    brazilianPortuguese: 'pt-BR',
    chinese: 'zh',
    hindi: 'hi',
    russian: 'ru',
    arabic: 'ar',
    korean: 'ko',
    turkish: 'tr',
    afrikaans: 'af'
  };

  function applyIntlLanguagePickerLabels(localeCode) {
    var pack = translations[localeCode];
    if (!pack || !pack.profile || !pack.profile.language) return;
    var pl = pack.profile.language;
    var intlLoc =
      localeCode === 'pt-BR' ? 'pt-BR' : localeCode === 'zh' ? 'zh-CN' : localeCode;
    try {
      var DN = new Intl.DisplayNames([intlLoc], { type: 'language' });
      Object.keys(PROFILE_LANG_KEYS_TO_BCP47).forEach(function (prop) {
        var bcp = PROFILE_LANG_KEYS_TO_BCP47[prop];
        try {
          var lbl = DN.of(bcp);
          if (lbl) pl[prop] = lbl;
        } catch (_) {}
      });
    } catch (_) {}
  }

  /** Localized month (long) and weekday (long) labels for filters/calendar UI. PPT/charts may still use short tokens from en. */
  function applyIntlCalendarMonthWeekdayLabels(localeCode) {
    var pack = translations[localeCode];
    if (!pack || !pack.calendarStats) return;
    var intlLoc =
      localeCode === 'pt-BR' ? 'pt-BR' : localeCode === 'zh' ? 'zh-CN' : localeCode;
    try {
      var months = [];
      for (var m = 0; m < 12; m++) {
        var d = new Date(Date.UTC(2000, m, 1));
        months.push(new Intl.DateTimeFormat(intlLoc, { month: 'long', timeZone: 'UTC' }).format(d));
      }
      pack.calendarStats.months = months;
      var days = [];
      var baseSun = new Date(Date.UTC(2020, 5, 7));
      for (var i = 0; i < 7; i++) {
        var dd = new Date(baseSun.getTime() + i * 86400000);
        days.push(new Intl.DateTimeFormat(intlLoc, { weekday: 'long', timeZone: 'UTC' }).format(dd));
      }
      pack.calendarStats.weekdaysFull = days;
    } catch (_) {}
  }

  /** Every selectable locale with a file-based full manual pack (same order as script tags before i18n.js). */
  var MANUAL_FILE_PACK_LOCALE_CODES = [
    'id', 'af', 'ar', 'pt-BR', 'zh', 'cs', 'da', 'nl', 'fi', 'it', 'de', 'fr', 'el', 'hi', 'ja', 'ko', 'no', 'pl', 'pt', 'ru', 'es', 'sv', 'tr', 'uk'
  ];
  (function applyIntlToManualFilePackLocales() {
    MANUAL_FILE_PACK_LOCALE_CODES.forEach(function (code) {
      if (translations[code]) {
      applyIntlLanguagePickerLabels(code);
      applyIntlCalendarMonthWeekdayLabels(code);
      }
    });
  })();

  /** True when `localeCode` is served by a file-based full manual pack (`window.__WH_TRANSLATIONS_*`). */
  function isManualFullUiPackLocale(localeCode) {
    if (typeof window === 'undefined') return false;
    var lc = String(localeCode || '');
    if (!lc) return false;
    if (lc === 'id') return true;
    var suffix = lc.toUpperCase().replace(/-/g, '_');
    return !!window['__WH_TRANSLATIONS_' + suffix];
  }

  // Canonical language selector list.
  // Keep this centralized so selector options always match manual i18n keys.
  var LANGUAGE_OPTION_DEFS = [
    { value: 'auto', key: 'profile.language.auto', fallback: 'Auto' },
    { value: 'en', key: 'profile.language.english', fallback: 'English' },
    { value: 'id', key: 'profile.language.indonesian', fallback: 'Bahasa Indonesia' },
    { value: 'de', key: 'profile.language.german', fallback: 'German' },
    { value: 'uk', key: 'profile.language.ukrainian', fallback: 'Ukrainian' },
    { value: 'fr', key: 'profile.language.french', fallback: 'French' },
    { value: 'pl', key: 'profile.language.polish', fallback: 'Polish' },
    { value: 'es', key: 'profile.language.spanish', fallback: 'Spanish' },
    { value: 'it', key: 'profile.language.italian', fallback: 'Italian' },
    { value: 'nl', key: 'profile.language.dutch', fallback: 'Dutch' },
    { value: 'sv', key: 'profile.language.swedish', fallback: 'Swedish' },
    { value: 'no', key: 'profile.language.norwegian', fallback: 'Norwegian' },
    { value: 'fi', key: 'profile.language.finnish', fallback: 'Finnish' },
    { value: 'da', key: 'profile.language.danish', fallback: 'Danish' },
    { value: 'pt', key: 'profile.language.portuguese', fallback: 'Portuguese' },
    { value: 'cs', key: 'profile.language.czech', fallback: 'Czech' },
    { value: 'el', key: 'profile.language.greek', fallback: 'Greek' },
    { value: 'ja', key: 'profile.language.japanese', fallback: 'Japanese' },
    { value: 'pt-BR', key: 'profile.language.brazilianPortuguese', fallback: 'Brazilian Portuguese' },
    { value: 'zh', key: 'profile.language.chinese', fallback: 'Chinese' },
    { value: 'hi', key: 'profile.language.hindi', fallback: 'Hindi' },
    { value: 'ru', key: 'profile.language.russian', fallback: 'Russian' },
    { value: 'ar', key: 'profile.language.arabic', fallback: 'Arabic' },
    { value: 'ko', key: 'profile.language.korean', fallback: 'Korean' },
    { value: 'tr', key: 'profile.language.turkish', fallback: 'Turkish' },
    { value: 'af', key: 'profile.language.afrikaans', fallback: 'Afrikaans' }
  ];
  var languageManualCoverageCache = {};
  var LANGUAGE_ROLLOUT_KEY = 'workingHoursLanguageRolloutStage';
  var LANGUAGE_ROLLOUT_STAGES = ['g3', 'g5', 'g10', 'g20', 'all'];
  var LANGUAGE_STAGE_ALLOWLIST = {
    g3: ['auto', 'en', 'id', 'de', 'ja'],
    g5: ['auto', 'en', 'id', 'de', 'ja', 'fr', 'it'],
    g10: ['auto', 'en', 'id', 'de', 'ja', 'fr', 'it', 'es', 'pt', 'ru', 'zh', 'ko'],
    g20: ['auto', 'en', 'id', 'de', 'ja', 'fr', 'it', 'es', 'pt', 'ru', 'zh', 'ko', 'ar', 'hi', 'tr'],
    all: null // null means use all language options
  };

  function isKnownLanguageValue(value) {
    return LANGUAGE_OPTION_DEFS.some(function (def) { return def.value === value; });
  }

  function normalizeRolloutStage(stage) {
    var s = String(stage || '').toLowerCase();
    if (LANGUAGE_ROLLOUT_STAGES.indexOf(s) !== -1) return s;
    return 'all';
  }

  function getRolloutStage() {
    var stored = null;
    try {
      stored = localStorage.getItem(LANGUAGE_ROLLOUT_KEY);
    } catch (_) {}
    return normalizeRolloutStage(stored || 'all');
  }

  function setRolloutStage(stage) {
    var normalized = normalizeRolloutStage(stage);
    try {
      localStorage.setItem(LANGUAGE_ROLLOUT_KEY, normalized);
    } catch (_) {}
    if (typeof applyTranslations === 'function') {
      applyTranslations(W.currentLanguage || 'en');
    }
    return normalized;
  }

  function isLanguageUnlockedByStage(value, stage) {
    var normalized = normalizeRolloutStage(stage);
    var allow = LANGUAGE_STAGE_ALLOWLIST[normalized];
    if (allow == null) return true;
    return allow.indexOf(value) !== -1;
  }

  function collectMissingPaths(baseObj, candidateObj, prefix, outMissing) {
    if (!baseObj || typeof baseObj !== 'object') return;
    Object.keys(baseObj).forEach(function (k) {
      var path = prefix ? (prefix + '.' + k) : k;
      var baseVal = baseObj[k];
      var candVal = candidateObj ? candidateObj[k] : undefined;

      if (baseVal && typeof baseVal === 'object' && !Array.isArray(baseVal)) {
        collectMissingPaths(baseVal, candVal && typeof candVal === 'object' ? candVal : null, path, outMissing);
        return;
      }

      if (typeof baseVal === 'string') {
        if (typeof candVal !== 'string' || !String(candVal).trim()) {
          outMissing.push(path);
        }
      }
    });
  }

  function isManualLanguagePackComplete(value) {
    if (value === 'auto' || value === 'en') return true;
    // For file-based manual packs, validate structure against `translations.en` so we can
    // detect incomplete locale generation/accidental script-order omissions.
    if (Object.prototype.hasOwnProperty.call(languageManualCoverageCache, value)) {
      return languageManualCoverageCache[value];
    }

    var target = String(value || '').trim();
    var short = target.toLowerCase().split('-')[0];
    var dict = translations[target] || translations[short] || null;
    if (!dict) {
      languageManualCoverageCache[value] = false;
      return false;
    }

    var missing = [];
    collectMissingPaths(translations.en, dict, '', missing);
    var complete = missing.length === 0;
    languageManualCoverageCache[value] = complete;
    return complete;
  }

  function rebuildLanguageSelect(targetLang, preferredValue, explicitAuto) {
    var sel = document.getElementById('languageSelect');
    if (!sel) return;

    var keep = explicitAuto ? 'auto' : String(preferredValue || sel.value || targetLang || 'en');
    var rolloutStage = getRolloutStage();
    var frag = document.createDocumentFragment();

    LANGUAGE_OPTION_DEFS.forEach(function (def) {
      var opt = document.createElement('option');
      opt.value = def.value;
      opt.setAttribute('data-i18n', def.key);
      var label = resolve(def.key, targetLang) || def.fallback || def.value;
      var unlocked = isLanguageUnlockedByStage(def.value, rolloutStage);
      var complete = isManualLanguagePackComplete(def.value);
      if (!unlocked && def.value !== 'auto') {
        label += resolve('profile.language.rolloutLocked', targetLang) || ' (rollout phase locked)';
        opt.disabled = true;
      } else if (!complete && def.value !== 'auto') {
        label += resolve('profile.language.manualPackPending', targetLang) || ' (manual pack not ready)';
        opt.disabled = true;
      }
      opt.textContent = label;
      frag.appendChild(opt);
    });

    sel.innerHTML = '';
    sel.appendChild(frag);

    if (!isKnownLanguageValue(keep)) keep = explicitAuto ? 'auto' : String(targetLang || 'en');
    if (!isLanguageUnlockedByStage(keep, rolloutStage)) keep = explicitAuto ? 'auto' : 'en';
    if (!isManualLanguagePackComplete(keep)) keep = explicitAuto ? 'auto' : 'en';
    if (!isKnownLanguageValue(keep)) keep = 'en';
    sel.value = keep;
  }

  function getBrowserLanguage() {
    var raw = (navigator.language || navigator.userLanguage || 'en').toString();
    var lang = raw.toLowerCase();
    if (lang === 'pt-br' && translations['pt-BR']) return 'pt-BR';
    if (translations[lang]) return lang;
    var short = lang.split('-')[0];
    if (translations[short]) return short;
    if (translations[raw]) return raw;
    return 'en';
  }

  function deepResolve(path, dict) {
    if (!dict) return null;
    return path.split('.').reduce(function (obj, key) {
      return obj && obj[key] != null ? obj[key] : null;
    }, dict);
  }

  function resolve(path, lang) {
    var requested = String(lang || '').trim();
    var short = requested.toLowerCase().split('-')[0];
    var value = deepResolve(path, translations[requested]);
    if (value != null) return value;
    value = deepResolve(path, translations[short]);
    if (value != null) return value;
    return deepResolve(path, translations.en);
  }

  /** Translate key for current language; optional subs = { count: 5 } for {count} replacement. */
  function t(key, subs) {
    var lang = W.currentLanguage || getBrowserLanguage();
    var s = resolve(key, lang);
    if (s == null) return key;
    if (typeof s !== 'string') return key;
    if (subs && typeof subs === 'object') {
      Object.keys(subs).forEach(function (k) {
        s = s.replace(new RegExp('\\{' + k + '\\}', 'g'), String(subs[k]));
      });
    }
    return s;
  }

  var uiPackTranslationCache = {};
  var uiPackTranslationInflight = {};
  /** One in-flight full prewarm promise per pack locale (e.g. pt-BR kept distinct from pt). */
  var uiPackWarmupInflightByLang = {};

  function canonicalUiPackLocale(raw) {
    var s = String(raw || '').trim();
    if (!s) return 'en';
    if (translations[s]) return s;
    var lo = s.toLowerCase();
    if (lo === 'pt-br' && translations['pt-BR']) return 'pt-BR';
    var short = lo.split('-')[0];
    if (translations[short]) return short;
    return s;
  }

  /** Google Translate `tl` parameter for a given pack key (not necessarily identical to pack key). */
  function googleUiPackTl(packLocale) {
    var pl = String(packLocale || '').trim();
    if (!pl) return 'en';
    var lo = pl.toLowerCase();
    if (lo === 'pt-br') return 'pt';
    if (lo === 'zh' || lo === 'zh-cn' || lo === 'zh-tw') return 'zh-CN';
    return lo.split('-')[0] || 'en';
  }

  function delayUiPackMs(ms) {
    return new Promise(function (resolve) {
      setTimeout(resolve, ms);
    });
  }

  function uiPackCacheStorageKey(localeCode) {
    return 'workingHoursUiPackTranslationCache::' + String(localeCode || 'en');
  }

  function loadUiPackCache(localeCode) {
    if (!localeCode) return;
    if (!uiPackTranslationCache[localeCode]) uiPackTranslationCache[localeCode] = {};
    try {
      var raw = localStorage.getItem(uiPackCacheStorageKey(localeCode));
      if (!raw) return;
      var parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        uiPackTranslationCache[localeCode] = parsed;
      }
    } catch (_) {}
  }

  function persistUiPackCache(localeCode) {
    if (!localeCode) return;
    try {
      localStorage.setItem(
        uiPackCacheStorageKey(localeCode),
        JSON.stringify(uiPackTranslationCache[localeCode] || {})
      );
    } catch (_) {}
  }

  // Offline-first behavior: the app must not require any internet access to translate UI/help.
  // Opt-in UI-pack / bulk string caching (developer):
  //   window.__WH_ALLOW_NETWORK_TRANSLATION__ = true;
  var ALLOW_NETWORK_TRANSLATION = (typeof window !== 'undefined' && window.__WH_ALLOW_NETWORK_TRANSLATION__ === true);

  // User-authored text (profile role, entry descriptions / day notes, search) uses Google Translate when online.
  // Default ON. Opt out with: window.__WH_DISABLE_DYNAMIC_USER_TEXT_TRANSLATION__ = true;
  var ALLOW_DYNAMIC_USER_TEXT_TRANSLATION =
    typeof window !== 'undefined' && window.__WH_DISABLE_DYNAMIC_USER_TEXT_TRANSLATION__ !== true;

  function shouldTranslateUiString(text) {
    if (text == null) return false;
    var trimmed = String(text).trim();
    if (!trimmed) return false;
    // Ignore placeholders and purely symbolic values.
    if (!/[A-Za-z\u00C0-\u024F\u1E00-\u1EFF]/.test(trimmed)) return false;
    return true;
  }

  function translateUiString(text, packLocale) {
    var pack = canonicalUiPackLocale(packLocale);
    var sourceText = String(text || '');
    if (
      !shouldTranslateUiString(sourceText) ||
      !ALLOW_NETWORK_TRANSLATION ||
      pack === 'en' ||
      isManualFullUiPackLocale(pack)
    ) {
      return Promise.resolve(sourceText);
    }
    if (!translations[pack]) return Promise.resolve(sourceText);
    if (!uiPackTranslationCache[pack]) uiPackTranslationCache[pack] = {};
    if (Object.prototype.hasOwnProperty.call(uiPackTranslationCache[pack], sourceText)) {
      return Promise.resolve(uiPackTranslationCache[pack][sourceText]);
    }
    var inflightKey = pack + '||' + sourceText;
    if (uiPackTranslationInflight[inflightKey]) return uiPackTranslationInflight[inflightKey];

    var tl = googleUiPackTl(pack);
    var url = DESCRIPTION_TRANSLATE_ENDPOINT +
      '?client=gtx&sl=auto&tl=' + encodeURIComponent(tl) +
      '&dt=t&q=' + encodeURIComponent(sourceText);
    uiPackTranslationInflight[inflightKey] = fetch(url)
      .then(function (res) {
        if (!res || !res.ok) throw new Error('translation_http_' + (res ? res.status : 'unknown'));
        return res.json();
      })
      .then(function (payload) {
        var translated = decodeGoogleTranslatePayload(payload);
        if (!translated) translated = sourceText;
        uiPackTranslationCache[pack][sourceText] = translated;
        persistUiPackCache(pack);
        return translated;
      })
      .catch(function () {
        uiPackTranslationCache[pack][sourceText] = sourceText;
        persistUiPackCache(pack);
        return sourceText;
      })
      .finally(function () {
        delete uiPackTranslationInflight[inflightKey];
      });
    return uiPackTranslationInflight[inflightKey];
  }

  function collectUiPackTranslatableStrings(localeCode) {
    var out = [];
    var seen = {};
    var enPack = translations.en || {};
    var targetPack = translations[localeCode] || {};

    function walk(enNode, targetNode) {
      if (typeof enNode === 'string') {
        var enText = enNode;
        var targetText = typeof targetNode === 'string' ? targetNode : enText;
        // If still English-equivalent, queue for translation warmup.
        if (targetText === enText && shouldTranslateUiString(enText) && !seen[enText]) {
          seen[enText] = true;
          out.push(enText);
        }
        return;
      }
      if (!enNode || typeof enNode !== 'object') return;
      Object.keys(enNode).forEach(function (k) {
        var nextTarget = targetNode && typeof targetNode === 'object' ? targetNode[k] : undefined;
        walk(enNode[k], nextTarget);
      });
    }

    walk(enPack, targetPack);
    return out;
  }

  function applyCachedUiPackTranslations(localeCode) {
    if (localeCode === 'en' || isManualFullUiPackLocale(localeCode)) return;
    if (!translations[localeCode] || !translations.en) return;
    loadUiPackCache(localeCode);
    var cache = uiPackTranslationCache[localeCode] || {};
    if (!Object.keys(cache).length) return;

    function walkAndApply(enNode, targetNode) {
      if (!enNode || typeof enNode !== 'object' || !targetNode || typeof targetNode !== 'object') return;
      Object.keys(enNode).forEach(function (k) {
        var ev = enNode[k];
        var tv = targetNode[k];
        if (typeof ev === 'string') {
          if (typeof tv !== 'string' || tv === ev) {
            if (Object.prototype.hasOwnProperty.call(cache, ev)) {
              targetNode[k] = cache[ev];
            }
          }
          return;
        }
        walkAndApply(ev, tv);
      });
    }

    walkAndApply(translations.en, translations[localeCode]);
  }

  /**
   * Fully hydrates cached UI translations for one pack: processes every remaining English-equivalent
   * string in batches (throttled) until the pack matches cache + structural merge.
   */
  function prewarmUiPackLocaleFully(packLocale, options) {
    var pack = canonicalUiPackLocale(packLocale);
    if (!ALLOW_NETWORK_TRANSLATION || pack === 'en' || isManualFullUiPackLocale(pack) || !translations[pack]) {
      return Promise.resolve({ pack: pack, skipped: true });
    }
    var opts = options && typeof options === 'object' ? options : {};
    var batchSize = opts.batchSize != null ? Math.max(1, opts.batchSize) : 28;
    var delayMs = opts.delayMs != null ? Math.max(0, opts.delayMs) : 100;
    var signal = opts.signal;

    if (uiPackWarmupInflightByLang[pack]) return uiPackWarmupInflightByLang[pack];

    function runBatch() {
      if (signal && signal.aborted) {
        return Promise.resolve({ pack: pack, aborted: true });
      }
      loadUiPackCache(pack);
      applyCachedUiPackTranslations(pack);
      var queue = collectUiPackTranslatableStrings(pack);
      if (!queue.length) {
        applyCachedUiPackTranslations(pack);
        persistUiPackCache(pack);
        return Promise.resolve({ pack: pack, done: true });
      }
      var batch = queue.slice(0, batchSize);
      var chain = Promise.resolve();
      batch.forEach(function (sourceText) {
        chain = chain.then(function () {
          return translateUiString(sourceText, pack);
        });
      });
      return chain
        .then(function () {
          applyCachedUiPackTranslations(pack);
          persistUiPackCache(pack);
          if (typeof opts.onBatch === 'function') {
            opts.onBatch({
              pack: pack,
              batchCount: batch.length,
              remainingInBatchPass: Math.max(0, queue.length - batch.length)
            });
          }
          if (queue.length > batch.length || collectUiPackTranslatableStrings(pack).length) {
            return delayUiPackMs(delayMs).then(runBatch);
          }
          return { pack: pack, done: true };
        });
    }

    uiPackWarmupInflightByLang[pack] = runBatch().finally(function () {
      delete uiPackWarmupInflightByLang[pack];
    });
    return uiPackWarmupInflightByLang[pack];
  }

  /** Sequentially prewarms locale packs that are not file-based full manual packs (skips `en` and all `isManualFullUiPackLocale` locales). */
  function prewarmAllUiPackLocales(options) {
    var opts = options && typeof options === 'object' ? options : {};
    if (!ALLOW_NETWORK_TRANSLATION) return Promise.resolve({ locales: 0, skipped: true });
    var codes = Object.keys(translations).filter(function (c) {
      return c !== 'en' && !isManualFullUiPackLocale(c) && translations[c];
    });
    codes.sort();
    var chain = Promise.resolve();
    codes.forEach(function (code) {
      chain = chain.then(function () {
        if (opts.signal && opts.signal.aborted) return { aborted: true };
        if (typeof opts.onLocaleStart === 'function') opts.onLocaleStart({ locale: code });
        return prewarmUiPackLocaleFully(code, opts).then(function (result) {
          if (typeof opts.onLocaleComplete === 'function') opts.onLocaleComplete(result || { pack: code });
          return result;
        });
      });
    });
    return chain.then(function () {
      if (typeof opts.onAllComplete === 'function') opts.onAllComplete();
      return { locales: codes.length };
    });
  }

  function applyTranslations(lang, options) {
    var opts = options && typeof options === 'object' ? options : {};
    var stored = null;
    try {
      stored = localStorage.getItem('workingHoursLanguage') || null;
    } catch (_) {}
    var explicitAuto = lang === 'auto';
    // Defaulting rule: when the caller does NOT explicitly request a language and
    // the stored value is "auto", prefer English so the default UI is stable.
    // (The <select> defaults to "auto" in HTML, but product default expects `en`.)
    if (!lang && stored === 'auto') stored = null;
    var targetLang = explicitAuto
      ? getBrowserLanguage()
      : (lang || stored || 'en');
    targetLang = String(targetLang || 'en').trim();
    var packLang = canonicalUiPackLocale(targetLang);
    rebuildLanguageSelect(targetLang, lang || stored || targetLang, explicitAuto);
    applyCachedUiPackTranslations(packLang);

    // Elements with text content
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var key = el.getAttribute('data-i18n');
      var value = resolve(key, targetLang);
      if (value != null) el.textContent = value;
    });

    // Attributes
    [
      ['data-i18n-title', 'title'],
      ['data-i18n-aria-label', 'aria-label'],
      ['data-i18n-placeholder', 'placeholder']
    ].forEach(function (pair) {
      var dataAttr = pair[0];
      var attr = pair[1];
      document.querySelectorAll('[' + dataAttr + ']').forEach(function (el) {
        var key = el.getAttribute(dataAttr);
        var value = resolve(key, targetLang);
        if (value != null) el.setAttribute(attr, value);
      });
    });

    try {
      localStorage.setItem('workingHoursLanguage', targetLang);
    } catch (_) {}
    W.currentLanguage = targetLang;

    try {
      var resolvedPackForDir = explicitAuto ? canonicalUiPackLocale(getBrowserLanguage()) : packLang;
      var rtlUi = resolvedPackForDir === 'ar';
      document.documentElement.setAttribute('dir', rtlUi ? 'rtl' : 'ltr');
      var htmlLangAttr =
        resolvedPackForDir === 'pt-BR' ? 'pt-BR' : resolvedPackForDir === 'zh' ? 'zh-CN' : resolvedPackForDir;
      document.documentElement.setAttribute('lang', htmlLangAttr || 'en');
    } catch (_) {}

    var langSelect = document.getElementById('languageSelect');
    if (langSelect) {
      if (explicitAuto) langSelect.value = 'auto';
      else langSelect.value = targetLang;
    }

    if (typeof W.refreshDynamicTranslations === 'function') W.refreshDynamicTranslations();

    if (!opts.skipUiPackWarmup && ALLOW_NETWORK_TRANSLATION && packLang !== 'en' && !isManualFullUiPackLocale(packLang)) {
      prewarmUiPackLocaleFully(packLang, { batchSize: 28, delayMs: 100 }).then(function () {
        if (W.currentLanguage === targetLang) applyTranslations(targetLang, { skipUiPackWarmup: true });
      });
    }
  }

  // -------- Dynamic translation for user-entered text --------
  // Guardrails:
  // - UI/help strings remain offline-first via file-based manual packs.
  // - This pipeline only translates user-entered values (profile role, entry descriptions, etc.).
  // - It is ON by default when online (Google `translate_a/single`). Opt out:
  //     window.__WH_DISABLE_DYNAMIC_USER_TEXT_TRANSLATION__ = true;
  // - Bulk UI-string prewarm remains separate (ALLOW_NETWORK_TRANSLATION / __WH_ALLOW_NETWORK_TRANSLATION__).
  //
  // Provider:
  // - Default uses the public Google Translate endpoint (same origin policy: browser fetch to Google).
  // - Future providers can be wired by swapping this endpoint/adaptor.
  var USER_TEXT_TRANSLATE_ENDPOINT = 'https://translate.googleapis.com/translate_a/single';
  var USER_TEXT_TRANSLATION_STORAGE_KEY = 'workingHoursUserTextTranslationCache';
  var userTextTranslationCache = {};
  var userTextTranslationInflight = {};

  function loadUserTextTranslationCacheFromStorage() {
    try {
      var raw = localStorage.getItem(USER_TEXT_TRANSLATION_STORAGE_KEY);
      if (!raw) return;
      var o = JSON.parse(raw);
      if (o && typeof o === 'object') {
        Object.keys(o).forEach(function (k) {
          if (typeof o[k] === 'string') userTextTranslationCache[k] = o[k];
        });
      }
    } catch (_) {}
  }

  function persistUserTextTranslationCache() {
    try {
      localStorage.setItem(USER_TEXT_TRANSLATION_STORAGE_KEY, JSON.stringify(userTextTranslationCache));
    } catch (_) {
      try {
        var keys = Object.keys(userTextTranslationCache);
        if (keys.length > 500) {
          keys.slice(0, keys.length - 500).forEach(function (del) {
            delete userTextTranslationCache[del];
          });
        }
        localStorage.setItem(USER_TEXT_TRANSLATION_STORAGE_KEY, JSON.stringify(userTextTranslationCache));
      } catch (_) {}
    }
  }

  loadUserTextTranslationCacheFromStorage();

  function resolveDynamicTranslationContextKey(contextKey) {
    // Context key helps keep caches separate for different UI fields.
    var ctx = String(contextKey || 'entryDescription');
    // Keep it small and safe (avoid huge cache keys due to user content).
    if (!ctx) ctx = 'entryDescription';
    return ctx;
  }

  function normalizeTargetLanguage(lang) {
    var l = String(lang || '').toLowerCase();
    if (!l) return 'en';
    if (l === 'zh-cn' || l === 'zh-tw') return 'zh';
    return l.split('-')[0] || 'en';
  }

  /** `tl` parameter for Google Translate `translate_a/single` (gtx client). */
  function googleTranslateTargetLang(lang) {
    var raw = String(lang || 'en').toLowerCase().trim();
    if (!raw || raw === 'en') return 'en';
    if (raw === 'zh' || raw === 'zh-cn' || raw === 'zh-tw' || raw.indexOf('zh-') === 0) return 'zh-CN';
    if (raw === 'pt-br') return 'pt';
    var base = raw.split('-')[0];
    if (base === 'zh') return 'zh-CN';
    return base || 'en';
  }

  function userTextCacheKey(text, targetLang, contextKey) {
    return normalizeTargetLanguage(targetLang) + '||' + resolveDynamicTranslationContextKey(contextKey) + '||' + String(text || '');
  }

  function decodeGoogleTranslatePayload(payload) {
    if (!Array.isArray(payload) || !Array.isArray(payload[0])) return null;
    var chunks = payload[0];
    var out = '';
    chunks.forEach(function (part) {
      if (Array.isArray(part) && part[0]) out += String(part[0]);
    });
    return out || null;
  }

  function shouldTranslateDescription(text) {
    if (text == null) return false;
    var trimmed = String(text).trim();
    if (!trimmed) return false;
    if (trimmed.length < 2) return false;
    // Skip mostly non-letter strings.
    if (!/[A-Za-z\u00C0-\u024F\u1E00-\u1EFF]/.test(trimmed)) return false;
    return true;
  }

  W.getTranslatedDynamicUserTextCached = function getTranslatedDynamicUserTextCached(text, targetLang, contextKey) {
    if (!shouldTranslateDescription(text)) return text || '';
    var key = userTextCacheKey(text, targetLang || W.currentLanguage || 'en', contextKey);
    return Object.prototype.hasOwnProperty.call(userTextTranslationCache, key)
      ? userTextTranslationCache[key]
      : null;
  };

  W.translateDynamicUserText = function translateDynamicUserText(text, targetLang, contextKey) {
    if (!ALLOW_DYNAMIC_USER_TEXT_TRANSLATION) return Promise.resolve(text || '');
    if (!shouldTranslateDescription(text)) return Promise.resolve(text || '');
    var target = normalizeTargetLanguage(targetLang || W.currentLanguage || 'en');
    var sourceText = String(text);
    var key = userTextCacheKey(sourceText, target, contextKey);

    if (Object.prototype.hasOwnProperty.call(userTextTranslationCache, key)) {
      return Promise.resolve(userTextTranslationCache[key]);
    }
    if (userTextTranslationInflight[key]) return userTextTranslationInflight[key];

    var tl = googleTranslateTargetLang(targetLang || W.currentLanguage || 'en');
    var url =
      USER_TEXT_TRANSLATE_ENDPOINT +
      '?client=gtx&sl=auto&tl=' +
      encodeURIComponent(tl) +
      '&dt=t&q=' +
      encodeURIComponent(sourceText);

    userTextTranslationInflight[key] = fetch(url)
      .then(function (res) {
        if (!res || !res.ok) throw new Error('translation_http_' + (res ? res.status : 'unknown'));
        return res.json();
      })
      .then(function (payload) {
        var translated = decodeGoogleTranslatePayload(payload);
        if (!translated) translated = sourceText;
        userTextTranslationCache[key] = translated;
        persistUserTextTranslationCache();
        return translated;
      })
      .catch(function () {
        // Graceful fallback: keep original text.
        userTextTranslationCache[key] = sourceText;
        persistUserTextTranslationCache();
        return sourceText;
      })
      .finally(function () {
        delete userTextTranslationInflight[key];
      });

    return userTextTranslationInflight[key];
  };

  // Backward compatible aliases (existing code uses these for entry descriptions).
  W.getTranslatedDescriptionCached = function getTranslatedDescriptionCached(text, targetLang) {
    return W.getTranslatedDynamicUserTextCached(text, targetLang, 'entryDescription');
  };

  W.translateDescriptionText = function translateDescriptionText(text, targetLang) {
    return W.translateDynamicUserText(text, targetLang, 'entryDescription');
  };

  W.translateVisibleDescriptionCells = function translateVisibleDescriptionCells(tbodyEl) {
    if (!ALLOW_DYNAMIC_USER_TEXT_TRANSLATION) return;
    var tbody = tbodyEl || document.getElementById('entriesBody');
    if (!tbody) return;
    var target = normalizeTargetLanguage(W.currentLanguage || 'en');

    tbody.querySelectorAll('td.entry-desc-hover[data-desc-original]').forEach(function (cell) {
      var encoded = cell.getAttribute('data-desc-original') || '';
      if (!encoded) return;
      var original = '';
      try { original = decodeURIComponent(encoded); } catch (_) { original = encoded; }
      if (!shouldTranslateDescription(original)) return;

      var cached = W.getTranslatedDynamicUserTextCached(original, target, 'entryDescription');
      if (cached) {
        cell.setAttribute('title', String(cached));
      }

      W.translateDynamicUserText(original, target, 'entryDescription').then(function (translated) {
        // Ignore if row got replaced/re-rendered.
        if (!cell || !cell.isConnected) return;
        var currentEncoded = cell.getAttribute('data-desc-original') || '';
        if (currentEncoded !== encoded) return;
        cell.setAttribute('title', String(translated || original));
      });
    });
  };

  W.I18N = {
    translations: translations,
    getBrowserLanguage: getBrowserLanguage,
    applyTranslations: applyTranslations,
    resolve: resolve,
    t: t,
    isManualLanguagePackComplete: isManualLanguagePackComplete,
    networkTranslationEnabled: ALLOW_NETWORK_TRANSLATION,
    dynamicUserTextTranslationEnabled: ALLOW_DYNAMIC_USER_TEXT_TRANSLATION,
    languageOptionDefs: LANGUAGE_OPTION_DEFS.slice(),
    getLanguageRolloutStage: getRolloutStage,
    setLanguageRolloutStage: setRolloutStage,
    getLanguageRolloutStages: function () { return LANGUAGE_ROLLOUT_STAGES.slice(); },
    canonicalUiPackLocale: canonicalUiPackLocale,
    prewarmUiPackLocaleFully: prewarmUiPackLocaleFully,
    prewarmAllUiPackLocales: prewarmAllUiPackLocales
  };
})(window.WorkHours || (window.WorkHours = {}));

