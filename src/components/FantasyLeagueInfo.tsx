import React from 'react';
import { Alert } from '@mui/material';
import FantasyLeagueTeams from './FantasyLeagueTeams';
import FantasyLeagueSettings from './FantasyLeagueSettings';
import RoundCalendar from './RoundCalendar';
import { FantasyLeague } from '../api/fantasyLeagueQueries';
import { useFantasyLeagueSeasons } from '../api/useFantasyLeagueSeasons';

const PRE_DRAFT_STATUSES = ['INACTIVE', 'ACTIVATED_PRESEASON', 'DRAFT_SCHEDULED'];

interface Props {

  currentUserId: number;
  fantasyLeague: FantasyLeague;
}

const FantasyLeagueInfo: React.FC<Props> = ({ currentUserId, fantasyLeague}) => {
    const { data: fantasyLeagueSeason } = useFantasyLeagueSeasons(fantasyLeague.id);
    const isOwner = fantasyLeague.owner?.id === currentUserId;

    // Pre-draft leagues with no round margin: drafting too late forces an automatic reduction
    const maxAvailableRounds =
        fantasyLeagueSeason?.realCurrentRound != null && fantasyLeagueSeason.maxRealRound > 0
            ? fantasyLeagueSeason.maxRealRound - fantasyLeagueSeason.realCurrentRound + 1
            : null;
    const showDraftDeadlineWarning =
        isOwner &&
        !!fantasyLeagueSeason &&
        PRE_DRAFT_STATUSES.includes(fantasyLeagueSeason.status) &&
        maxAvailableRounds != null &&
        fantasyLeagueSeason.numberOfRounds >= maxAvailableRounds;
    const draftCutoffRound = fantasyLeagueSeason
        ? fantasyLeagueSeason.maxRealRound - fantasyLeagueSeason.numberOfRounds + 2
        : null;

    return (
        <>
            {showDraftDeadlineWarning && (
                <Alert severity="warning" sx={{ mt: 2 }}>
                    O draft precisa ocorrer antes da rodada {draftCutoffRound} do campeonato.
                    Caso contrário, o número de rodadas da liga será reduzido automaticamente
                    {maxAvailableRounds != null && maxAvailableRounds < fantasyLeagueSeason!.numberOfRounds
                        ? ` para ${maxAvailableRounds}`
                        : ''}.
                </Alert>
            )}
            <FantasyLeagueSettings isOwner={isOwner} fantasyLeague={fantasyLeague} />
            {fantasyLeagueSeason && (
                <RoundCalendar fantasyLeagueSeason={fantasyLeagueSeason} isOwner={isOwner} />
            )}
            <FantasyLeagueTeams fantasyLeague={fantasyLeague} />
        </>
    );
};

export default FantasyLeagueInfo;
