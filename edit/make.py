import subprocess, glob, os, wave, numpy as np
U="/root/.claude/uploads/d96c05de-5097-5069-8ba2-57c41c56b127/"
OUT="/home/user/paginaweb/edit/"; T=OUT+"tmp/"; os.makedirs(T,exist_ok=True)
order=["fd4933d9","8345d1bf","8db432da","9d2e7ac8","979dbefc","a5304354","4b17af20"]
src=[glob.glob(U+p+"*")[0] for p in order]
def dur(f):
    return float(subprocess.check_output(["ffprobe","-v","error","-show_entries","format=duration","-of","csv=p=0",f]))
BEAT=0.5; pat=[1.0,1.5,1.0,1.0,1.5,1.0,1.5]; segs=[]; k=0
for f in src:
    D=dur(f); n=1 if D<4 else (2 if D<6 else 3)
    for j in range(n):
        d=pat[k%len(pat)]; k+=1
        start=0.2 if n==1 else 0.2+j*(D-0.4-d)/(n-1)
        start=max(0,min(start,D-d-0.05)); segs.append((f,start,d))
W,H=1080,1920; FPS=30; files=[]
for i,(f,s,d) in enumerate(segs):
    horiz = "4b17af20" in f
    pre = "crop=ih*9/16:ih," if horiz else ""
    zin = i%2==0; z0,z1=(1.0,1.2) if zin else (1.25,1.02)
    # quick punch at each cut start
    zexpr=f"({z0}+({z1}-{z0})*t/{d})*(1+0.12*max(0,1-t/0.18))"
    vf=(f"{pre}scale={W*1.4:.0f}:-2,scale=w='trunc({W}*{zexpr}/2)*2':h=-2:eval=frame,"
        f"crop={W}:{H},fps={FPS},format=yuv420p")
    o=f"{T}s{i}.mp4"; files.append(o)
    subprocess.run(["ffmpeg","-v","error","-y","-ss",str(s),"-t",str(d),"-i",f,"-an","-vf",vf,
        "-c:v","libx264","-preset","veryfast","-crf","20",o],check=True)
open(T+"l.txt","w").write("".join(f"file '{x}'\n" for x in files))
subprocess.run(["ffmpeg","-v","error","-y","-f","concat","-safe","0","-i",T+"l.txt","-c","copy",T+"v.mp4"],check=True)
total=sum(d for _,_,d in segs); SR=44100; N=int((total+0.5)*SR); a=np.zeros(N); rng=np.random.default_rng(1)
def add(x,t):
    i=int(t*SR); x=x[:max(0,N-i)]; a[i:i+len(x)]+=x
def tt(l): return np.arange(int(l*SR))/SR
def kick(): t=tt(.3); return np.sin(2*np.pi*(45*t+90*(1-np.exp(-t*30))/30*0+ 110*np.exp(-t*25)*0.0)*1)*0+np.sin(2*np.pi*np.cumsum(50+110*np.exp(-t*30))/SR)*np.exp(-t*9)
def hat(): t=tt(.06); return rng.normal(size=len(t))*np.exp(-t*70)*.25
def bass(f): t=tt(.45); return (np.sign(np.sin(2*np.pi*f*t))*.5+np.sin(2*np.pi*f*t))*.18*np.exp(-t*4)
def whoosh(l=.5):
    t=tt(l); n=rng.normal(size=len(t)); env=(t/l)**2
    # crude sweep: moving average that shortens over time
    y=np.convolve(n,np.ones(40)/40,'same')*(1-t/l)+n*(t/l)*.6
    return y*env*.5
def impact(): t=tt(.5); return (np.sin(2*np.pi*55*t)*.9+rng.normal(size=len(t))*.3*np.exp(-t*30))*np.exp(-t*7)
roots=[55,55,65.4,49]
nb=int((total+0.5)/BEAT)
for b in range(nb):
    t=b*BEAT; add(kick()*.9,t); add(hat(),t+BEAT/2); add(bass(roots[(b//4)%4]),t)
    if b%4==3: add(hat()*2,t+BEAT*.75)
c=0
for _,_,d in segs[:-1]:
    c+=d; add(whoosh(),c-.45); add(impact()*.8,c)
add(impact(),0); a=a/np.max(np.abs(a))*.9
a=np.tanh(a*1.4)
with wave.open(T+"a.wav","wb") as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((a*32000).astype(np.int16).tobytes())
subprocess.run(["ffmpeg","-v","error","-y","-i",T+"v.mp4","-i",T+"a.wav","-t",f"{total:.2f}","-c:v","copy","-c:a","aac","-b:a","192k","-shortest",OUT+"video_final.mp4"],check=True)
print(len(segs),"segmentos",total,"s")
