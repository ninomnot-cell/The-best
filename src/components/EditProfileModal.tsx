import React, { useState } from 'react';
import { useClub } from '../context/ClubContext';
import { Member } from '../types';
import { 
  X, 
  Save, 
  User, 
  Phone, 
  MapPin, 
  CreditCard, 
  Briefcase, 
  Mail, 
  KeyRound, 
  DollarSign,
  CheckCircle2
} from 'lucide-react';

interface EditProfileModalProps {
  member: Member;
  onClose: () => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({ member, onClose }) => {
  const { updateMemberProfile } = useClub();

  const [nameKhmer, setNameKhmer] = useState(member.nameKhmer);
  const [nameEnglish, setNameEnglish] = useState(member.nameEnglish || '');
  const [phone, setPhone] = useState(member.phone);
  const [idCardNumber, setIdCardNumber] = useState(member.idCardNumber);
  const [occupation, setOccupation] = useState(member.occupation || '');
  const [address, setAddress] = useState(member.address || '');
  const [email, setEmail] = useState(member.email || '');
  const [monthlyCommitment, setMonthlyCommitment] = useState<number>(member.monthlyCommitment || 100);
  const [pin, setPin] = useState(member.pin || '1234');
  const [isSaved, setIsSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameKhmer || !phone || !idCardNumber) return;

    updateMemberProfile(member.id, {
      nameKhmer,
      nameEnglish,
      phone,
      idCardNumber,
      occupation,
      address,
      email,
      monthlyCommitment: Number(monthlyCommitment),
      pin
    });

    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-blue-100 text-[#00609C] flex items-center justify-center font-bold text-sm">
              {nameKhmer.charAt(0)}
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                កែប្រែព័ត៌មានផ្ទាល់ខ្លួន (Edit Profile)
              </h2>
              <p className="text-xs text-slate-500 font-mono">
                {member.memberCode} · តួនាទី: {member.role}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSaved ? (
          <div className="py-12 flex flex-col items-center justify-center space-y-3 text-center">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 animate-bounce" />
            <div className="text-base font-bold text-slate-900">
              បានរក្សាទុកព័ត៌មានដោយជោគជ័យ!
            </div>
            <p className="text-xs text-slate-500">
              ទិន្នន័យផ្ទាល់ខ្លួនរបស់អ្នកត្រូវបានធ្វើបច្ចុប្បន្នភាពរួចរាល់ហើយ។
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* Name Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  ឈ្មោះជាភាសាខ្មែរ *
                </label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={nameKhmer}
                    onChange={(e) => setNameKhmer(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-[#00609C]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  ឈ្មោះជាអក្សរឡាតាំង (English Name)
                </label>
                <input
                  type="text"
                  placeholder="Sok Chenda"
                  value={nameEnglish}
                  onChange={(e) => setNameEnglish(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-[#00609C]"
                />
              </div>
            </div>

            {/* Phone & ID Card */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  លេខទូរស័ព្ទទំនាក់ទំនង *
                </label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-lg font-mono focus:outline-none focus:border-[#00609C]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  លេខអត្តសញ្ញាណប័ណ្ណ *
                </label>
                <div className="relative">
                  <CreditCard className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={idCardNumber}
                    onChange={(e) => setIdCardNumber(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-lg font-mono focus:outline-none focus:border-[#00609C]"
                  />
                </div>
              </div>
            </div>

            {/* Occupation & Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  មុខរបរ / អាជីវកម្ម
                </label>
                <div className="relative">
                  <Briefcase className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="ឧ. ម្ចាស់អាជីវកម្ម, បុគ្គលិក..."
                    value={occupation}
                    onChange={(e) => setOccupation(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-[#00609C]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  អ៊ីមែល (Email)
                </label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    placeholder="example@thebestclub.kh"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-lg font-mono focus:outline-none focus:border-[#00609C]"
                  />
                </div>
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                អាសយដ្ឋានបច្ចុប្បន្ន
              </label>
              <div className="relative">
                <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <textarea
                  rows={2}
                  placeholder="ផ្ទះលេខ, ផ្លូវ, សង្កាត់, ខណ្ឌ, រាជធានីភ្នំពេញ..."
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-[#00609C]"
                />
              </div>
            </div>

            {/* Security PIN & Monthly Commitment */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  កាតព្វកិច្ចសន្សំប្រចាំខែ ($ USD)
                </label>
                <div className="relative">
                  <DollarSign className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="number"
                    min="10"
                    step="10"
                    value={monthlyCommitment}
                    onChange={(e) => setMonthlyCommitment(Number(e.target.value))}
                    className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-lg font-mono font-bold text-sm bg-white focus:outline-none focus:border-[#00609C]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  លេខកូដសម្ងាត់ PIN ចូលប្រើប្រព័ន្ធ
                </label>
                <div className="relative">
                  <KeyRound className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    maxLength={6}
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-lg font-mono font-bold tracking-widest bg-white focus:outline-none focus:border-[#00609C]"
                  />
                </div>
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  លេខសម្ងាត់សម្រាប់ Log in ចូលប្រើគណនីរបស់អ្នក
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg font-medium cursor-pointer"
              >
                បោះបង់
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-4 py-2 text-white bg-[#00609C] hover:bg-[#004f80] rounded-lg font-bold shadow-xs transition-colors cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>រក្សាទុកព័ត៌មានកែប្រែ</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
