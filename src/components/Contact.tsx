import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, Phone, MapPin, Send, Github, Linkedin, Twitter, AlertCircle } from 'lucide-react';
import { Contact } from '../types';

interface ContactProps {
  contact: Contact;
}

export default function ContactSection({ contact }: ContactProps) {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;
    
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
      setTimeout(() => setIsSubmitted(false), 5000);
    }, 1200);
  };

  return (
    <section id="contact" className="py-24 relative overflow-hidden bg-slate-900/10">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col items-center text-center mb-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="flex items-center gap-2 px-3 py-1 rounded-full border border-purple-500/20 bg-purple-500/5 text-purple-400 font-mono text-xs mb-4"
          >
            <Mail size={14} />
            CONTACT
          </motion.div>
          <h2 className="text-3xl sm:text-4xl font-sans tracking-tight font-extrabold text-white">
            Get in Touch
          </h2>
          <div className="w-12 h-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mt-4" />
        </div>

        <div className="max-w-xl mx-auto">
          {/* Contact Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <div className="p-8 sm:p-10 rounded-2xl bg-slate-900 bg-opacity-70 border border-slate-800 space-y-8 shadow-2xl relative overflow-hidden text-center">
              <div className="absolute top-0 right-0 p-6 opacity-[0.02] text-purple-400 font-mono text-7xl font-bold select-none pointer-events-none">
                CONTACT
              </div>
              
              <div className="max-w-sm mx-auto">
                <h3 className="text-xl sm:text-2xl font-sans font-bold text-white mb-3">Connect Directly</h3>
                <p className="text-slate-400 text-sm leading-relaxed">Have a vision or requirement? Let's discuss details over mail or physical coordinates.</p>
              </div>

              <div className="space-y-6 max-w-sm mx-auto text-left py-4">
                <div className="flex items-start gap-4">
                  <span className="p-3 bg-purple-500/10 text-purple-400 rounded-xl border border-purple-500/10 shrink-0">
                    <Mail size={18} />
                  </span>
                  <div>
                    <h4 className="text-xs font-mono uppercase tracking-wider text-slate-500">Email Address</h4>
                    <p className="text-slate-200 text-sm hover:text-purple-400 break-all">{contact.email}</p>
                  </div>
                </div>

                {contact.phone && (
                  <div className="flex items-start gap-4">
                    <span className="p-3 bg-pink-500/10 text-pink-400 rounded-xl border border-pink-500/10 shrink-0">
                      <Phone size={18} />
                    </span>
                    <div>
                      <h4 className="text-xs font-mono uppercase tracking-wider text-slate-500">Phone Number</h4>
                      <p className="text-slate-200 text-sm">{contact.phone}</p>
                    </div>
                  </div>
                )}

                {contact.address && (
                  <div className="flex items-start gap-4">
                    <span className="p-3 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/10 shrink-0">
                      <MapPin size={18} />
                    </span>
                    <div>
                      <h4 className="text-xs font-mono uppercase tracking-wider text-slate-500">Location</h4>
                      <p className="text-slate-200 text-sm">{contact.address}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Social Media Link Grid */}
              <div className="pt-6 border-t border-slate-800/80 flex items-center justify-center gap-4">
                {contact.github && (
                  <a
                    href={contact.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3.5 bg-slate-950 hover:bg-purple-600 rounded-xl border border-slate-800 text-slate-400 hover:text-white transition-all duration-300 transform hover:-translate-y-1 block"
                  >
                    <Github size={18} />
                  </a>
                )}
                {contact.linkedin && (
                  <a
                    href={contact.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3.5 bg-slate-950 hover:bg-purple-600 rounded-xl border border-slate-800 text-slate-400 hover:text-white transition-all duration-300 transform hover:-translate-y-1 block"
                  >
                    <Linkedin size={18} />
                  </a>
                )}
                {contact.twitter && (
                  <a
                    href={contact.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3.5 bg-slate-950 hover:bg-purple-600 rounded-xl border border-slate-800 text-slate-400 hover:text-white transition-all duration-300 transform hover:-translate-y-1 block"
                  >
                    <Twitter size={18} />
                  </a>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
