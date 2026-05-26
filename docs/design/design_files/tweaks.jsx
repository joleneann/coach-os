// Coach OS · Tweaks panel. Token decisions surfaced for review.

function CosTweaks() {
  const [tweaks, setTweak] = useTweaks(/*EDITMODE-BEGIN*/{
    "accent": "#d97706",
    "voiceMetaphor": "breath",
    "introCopy": true
  }/*EDITMODE-END*/);

  React.useEffect(() => {
    document.documentElement.style.setProperty('--cos-accent', tweaks.accent);
    document.documentElement.dataset.voice = tweaks.voiceMetaphor;
    document.documentElement.dataset.notes = tweaks.introCopy ? '1' : '0';
  }, [tweaks]);

  return (
    <TweaksPanel title="Coach OS · Tweaks">
      <TweakSection label="Accent">
        <TweakColor
          label="Primary action"
          value={tweaks.accent}
          onChange={(v) => setTweak('accent', v)}
          options={['#d97706', '#b45309', '#c2410c', '#a16207', '#78350f']}
        />
      </TweakSection>

      <TweakSection label="Voice recorder">
        <TweakRadio
          label="Metaphor"
          value={tweaks.voiceMetaphor}
          onChange={(v) => setTweak('voiceMetaphor', v)}
          options={[
            { value: 'breath', label: 'Breath' },
            { value: 'wave', label: 'Wave' },
            { value: 'restraint', label: 'Quiet' },
          ]}
        />
      </TweakSection>

      <TweakSection label="Canvas">
        <TweakToggle
          label="Designer notes on cards"
          value={tweaks.introCopy}
          onChange={(v) => setTweak('introCopy', v)}
        />
      </TweakSection>
    </TweaksPanel>
  );
}

window.CosTweaks = CosTweaks;
