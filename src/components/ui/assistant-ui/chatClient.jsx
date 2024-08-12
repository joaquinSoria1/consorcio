"use client"

import { useRef, useState, useEffect } from 'react';
import { useUIState, useActions } from 'ai/rsc';
import { AI } from '@/app/action';
import { useSession } from 'next-auth/react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Send, Mic } from 'lucide-react';
import { useEnterSubmit } from '@/lib/hooks/use-enter-submit';
import Avvvatars from 'avvvatars-react';

export function ChatClient({ imagenPerfil, username }) {
  const [messages, setMessages] = useUIState(AI);
  const { submitUserMessage, payExpense } = useActions(AI);
  const [inputValue, setInputValue] = useState('');
  const { formRef, onKeyDown } = useEnterSubmit();
  const inputRef = useRef(null);
  const { data: session } = useSession();
  const [isListening, setIsListening] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [transcript, setTranscript] = useState('');

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === '/' && !['INPUT', 'TEXTAREA'].includes(e.target.nodeName)) {
        e.preventDefault();
        e.stopPropagation();
        inputRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSubmit = async (e, message = inputValue) => {
    e.preventDefault();
    if (message.trim() === '') return;

    setMessages(currentMessages => [
      ...currentMessages,
      { role: 'user', content: message }
    ]);
    setInputValue('');

    try {
      const response = await submitUserMessage(message, session);
      setMessages(currentMessages => [
        ...currentMessages,
        { role: 'assistant', content: response.display }
      ]);
    } catch (error) {
      console.error("Error submitting message:", error);
    }
  };

  const requestMicrophonePermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      setHasPermission(true);
      return true;
    } catch (error) {
      console.error('Error requesting microphone permission:', error);
      return false;
    }
  };

  const handleVoiceInput = async () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Lo siento, tu navegador no soporta el reconocimiento de voz.');
      return;
    }
  
    if (!hasPermission) {
      const permissionGranted = await requestMicrophonePermission();
      if (!permissionGranted) {
        alert('Se requiere permiso para usar el micrófono.');
        return;
      }
    }
  
    setIsListening(true);
    setTranscript('');
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
  
    // Configurar para español
    recognition.lang = 'es-ES';
  
    // Mejorar la precisión
    recognition.interimResults = true;
    recognition.continuous = false;
    recognition.maxAlternatives = 1;
  
    let finalTranscript = '';
  
    recognition.onresult = (event) => {
      let interimTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }
      setTranscript(finalTranscript || interimTranscript);
    };
  
    recognition.onend = () => {
      setIsListening(false);
      if (finalTranscript) {
        handleSubmit({ preventDefault: () => {} }, finalTranscript);
      }
      setTranscript('');
    };
  
    recognition.onerror = (event) => {
      console.error('Speech recognition error', event.error);
      setIsListening(false);
    };
  
    recognition.start();
  
    setTimeout(() => {
      if (recognition.state === 'running') {
        recognition.stop();
      }
    }, 10000);
  };

  const handleQuickQuestion = (question) => {
    handleSubmit({ preventDefault: () => {} }, question);
  };

  return (
    <div className="flex h-full flex-col items-center pb-3">
      <div className="flex w-full flex-grow flex-col items-center overflow-y-scroll scroll-smooth px-4 pt-12">
        {messages.length === 0 ? (
          <ThreadEmpty onQuickQuestion={handleQuickQuestion} />
        ) : (
          messages.map((message, index) => (
            message.role === 'user' ? (
              <UserMessage key={index} content={message.content} imagenPerfil={imagenPerfil} username={username} />
            ) : (
              <AssistantMessage key={index} content={message.content} />
            )
          ))
        )}
      </div>
      <Composer
        inputValue={inputValue}
        setInputValue={setInputValue}
        handleSubmit={handleSubmit}
        inputRef={inputRef}
        onKeyDown={onKeyDown}
        handleVoiceInput={handleVoiceInput}
        isListening={isListening}
        transcript={transcript}
      />
    </div>
  );
}


const ThreadEmpty = ({ onQuickQuestion }) => (
  <div className="flex flex-grow flex-col items-center justify-center text-center">
    <Avatar className="h-20 w-20">
      <AvatarImage src={`/assets/manolito1.png`} />
      <AvatarFallback></AvatarFallback>
    </Avatar>
    <h2 className="text-2xl font-bold mb-2">¡Hola! Soy Manolito</h2>
    <p className="text-lg mb-6">Tu asistente virtual de Resired. ¿En qué puedo ayudarte hoy?</p>
    <div className="space-y-4 flex flex-col">
      <QuickQuestion onClick={() => onQuickQuestion("Muestrame mi información personal")}>
        Muestrame mi información personal
      </QuickQuestion>
      <QuickQuestion onClick={() => onQuickQuestion("¿Cuáles son mis expensas pendientes?")}>
        ¿Cuáles son mis expensas pendientes?
      </QuickQuestion>
      <QuickQuestion onClick={() => onQuickQuestion("Quiero hacer una reserva")}>
        Quiero hacer una reserva
      </QuickQuestion>
    </div>
  </div>
);

const QuickQuestion = ({ children, onClick }) => (
  <button
    className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full hover:bg-blue-200 transition-colors"
    onClick={onClick}
  >
    {children}
  </button>
);

const Composer = ({ inputValue, setInputValue, handleSubmit, inputRef, onKeyDown, handleVoiceInput, isListening, transcript }) => (
  <form onSubmit={handleSubmit} className="flex w-[calc(100%-32px)] max-w-[42rem] items-end rounded-lg border p-2 transition-shadow focus-within:shadow-md">
    <input
      ref={inputRef}
      value={isListening ? transcript : inputValue}
      onChange={(e) => setInputValue(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          handleSubmit(e);
        } else {
          onKeyDown(e);
        }
      }}
      placeholder={isListening ? "Escuchando..." : "Escribe tu mensaje aquí..."}
      className="placeholder:text-gray-400 h-12 max-h-40 flex-grow resize-none bg-transparent p-3 text-sm outline-none"
      disabled={isListening}
    />
    <button
      type="button"
      onClick={handleVoiceInput}
      className={`m-1 flex h-10 w-10 items-center justify-center rounded-full text-white shadow transition-colors ${isListening ? 'bg-red-500' : 'bg-blue-500 hover:bg-blue-600'}`}
    >
      <Mic className="size-5" />
    </button>
    <button
      type="submit"
      disabled={isListening || (!isListening && inputValue.trim() === '')}
      className="bg-blue-500 hover:bg-blue-600 m-1 flex h-10 w-10 items-center justify-center rounded-full text-white shadow transition-colors disabled:opacity-50"
    >
      <Send className="size-5" />
    </button>
  </form>
);

const UserMessage = ({ content, imagenPerfil, username }) => (
  <div className="relative mb-6 flex w-full max-w-2xl flex-col items-end gap-2 pl-24">
    <div className="relative mr-1 flex items-start gap-3">
      <div className="bg-blue-100 text-blue-800 max-w-xl break-words rounded-2xl px-5 py-3 shadow">
        {content}
      </div>
      {imagenPerfil ? (
        <Avatar>
          <AvatarImage src={`data:image/jpeg;base64,${Buffer.from(imagenPerfil).toString('base64')}`} />
          <AvatarFallback></AvatarFallback>
        </Avatar>
      ) : (
        <Avvvatars value={username} size={40} style="character" />
      )}
      <span className="sr-only">Toggle user menu</span>
    </div>
  </div>
);

const AssistantMessage = ({ content }) => {
  return (
    <div className="relative mb-6 flex w-full max-w-2xl gap-3">
      <Avatar className="h-10 w-10">
        <AvatarImage src={`/assets/manolito1.png`} />
        <AvatarFallback></AvatarFallback>
      </Avatar>
      <div className="mt-1 flex-grow">
        <div className="bg-gray-100 text-gray-800 max-w-x break-words rounded-2xl px-5 py-3 shadow">
          {content}
        </div>
      </div>
    </div>
  );
}