import { useState, useRef, useCallback, useEffect } from "react";
import { Microphone02, StopCircle, X } from "@untitledui/icons";
import { ButtonUtility } from "@/shared/ui/buttons/button-utility";
import { cx } from "@/shared/utils/cx";

interface VoiceRecorderProps {
    onRecordingComplete: (audioBlob: Blob, duration: number) => void;
    className?: string;
}

export function VoiceRecorder({ onRecordingComplete, className }: VoiceRecorderProps) {
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [audioLevel, setAudioLevel] = useState(0);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const animationFrameRef = useRef<number | null>(null);

    const startRecording = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

            // Setup audio analyser for visualization
            const audioContext = new AudioContext();
            const source = audioContext.createMediaStreamSource(stream);
            const analyser = audioContext.createAnalyser();
            analyser.fftSize = 256;
            source.connect(analyser);
            analyserRef.current = analyser;

            // Start recording
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
                onRecordingComplete(audioBlob, recordingTime);

                // Stop all tracks
                stream.getTracks().forEach(track => track.stop());
                audioContext.close();
            };

            mediaRecorder.start(100);
            setIsRecording(true);
            setRecordingTime(0);

            // Start timer
            timerRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);

            // Start audio level visualization
            const updateAudioLevel = () => {
                if (analyserRef.current) {
                    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
                    analyserRef.current.getByteFrequencyData(dataArray);
                    const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
                    setAudioLevel(average / 255);
                }
                animationFrameRef.current = requestAnimationFrame(updateAudioLevel);
            };
            updateAudioLevel();

        } catch (error) {
            console.error("Error accessing microphone:", error);
        }
    }, [onRecordingComplete, recordingTime]);

    const stopRecording = useCallback(() => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);

            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }

            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
                animationFrameRef.current = null;
            }

            setAudioLevel(0);
        }
    }, [isRecording]);

    const cancelRecording = useCallback(() => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            audioChunksRef.current = []; // Clear chunks to not trigger onRecordingComplete
            setIsRecording(false);

            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }

            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
                animationFrameRef.current = null;
            }

            setAudioLevel(0);
            setRecordingTime(0);
        }
    }, [isRecording]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
            if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        };
    }, []);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    };

    if (isRecording) {
        return (
            <div className={cx("flex items-center gap-3", className)}>
                {/* Cancel button */}
                <ButtonUtility
                    icon={X}
                    size="sm"
                    color="tertiary"
                    onClick={cancelRecording}
                />

                {/* Recording indicator */}
                <div className="flex items-center gap-2">
                    <div className="relative flex size-3 items-center justify-center">
                        <div className="absolute size-full animate-ping rounded-full bg-red-500 opacity-75" />
                        <div className="size-2 rounded-full bg-red-500" />
                    </div>
                    <span className="text-sm font-medium text-red-500">
                        {formatTime(recordingTime)}
                    </span>
                </div>

                {/* Audio level visualization */}
                <div className="flex h-6 flex-1 items-center gap-0.5">
                    {Array.from({ length: 20 }).map((_, i) => (
                        <div
                            key={i}
                            className="w-1 rounded-full bg-brand-500 transition-all"
                            style={{
                                height: `${Math.max(4, audioLevel * 24 * (0.5 + Math.random() * 0.5))}px`,
                            }}
                        />
                    ))}
                </div>

                {/* Stop button */}
                <ButtonUtility
                    icon={StopCircle}
                    size="sm"
                    color="tertiary"
                    onClick={stopRecording}
                />
            </div>
        );
    }

    return (
        <ButtonUtility
            icon={Microphone02}
            size="xs"
            color="tertiary"
            onClick={startRecording}
            className={className}
        />
    );
}
