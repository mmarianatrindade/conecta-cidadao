import React, { ReactNode } from 'react';
import { StyleSheet, View, Text, Pressable, ViewStyle, TextStyle, ActivityIndicator } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { T } from '../ui/theme';

export function Icon({name,size=21,color=T.ink}: {name:string,size?:number,color?:string}) {
  return <Ionicons name={name as React.ComponentProps<typeof Ionicons>['name']} size={size} color={color}/>;
}
export function Label({children,style}: {children:ReactNode;style?:TextStyle}) {
  return <Text style={[styles.label,style]}>{children}</Text>;
}
export function Heading({children,style}: {children:ReactNode;style?:TextStyle}) {
  return <Text style={[styles.heading,style]}>{children}</Text>;
}
export function Body({children,style}: {children:ReactNode;style?:TextStyle}) {
  return <Text style={[styles.body,style]}>{children}</Text>;
}
export function Small({children,style}: {children:ReactNode;style?:TextStyle}) {
  return <Text style={[styles.small,style]}>{children}</Text>;
}
export function Surface({children,style}: {children:ReactNode;style?:ViewStyle}) {
  return <View style={[styles.surface,style]}>{children}</View>;
}
export function Rule(){ return <View style={{height:1,backgroundColor:T.line,marginVertical:13}}/>; }
export function Pill({children,tint=T.green,bg=T.mint}: {children:ReactNode;tint?:string;bg?:string}) {
  return <View style={{backgroundColor:bg,borderRadius:999,paddingHorizontal:11,paddingVertical:6,alignSelf:'flex-start'}}><Text style={{fontSize:11,fontWeight:'700',color:tint}}>{children}</Text></View>;
}
export function Button({title,onPress,icon,kind='primary',style,disabled=false,loading=false}: {title:string;onPress:()=>void;icon?:string;kind?:'primary'|'soft'|'outline'|'danger';style?:ViewStyle;disabled?:boolean;loading?:boolean}) {
  const bg=kind==='primary'?T.navy:kind==='danger'?T.red:kind==='soft'?T.mint:T.white;
  const text=kind==='primary'||kind==='danger'?T.white:T.navy;
  return <Pressable accessibilityRole="button" accessibilityLabel={title} disabled={disabled||loading} onPress={onPress} style={({pressed})=>[styles.button,{backgroundColor:bg,borderColor:kind==='outline'?T.line:bg,opacity:disabled?0.45:pressed?0.8:1},style]}>
    {loading?<ActivityIndicator color={text}/>:icon?<Icon name={icon} size={18} color={text}/>:null}
    <Text style={{color:text,fontSize:14,fontWeight:'800'}}>{title}</Text>
  </Pressable>;
}
export function RoundButton({icon,onPress,label,filled=false,color=T.green}: {icon:string;onPress:()=>void;label:string;filled?:boolean;color?:string}) {
  return <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label} hitSlop={5} style={({pressed})=>[{height:44,width:44,alignItems:'center',justifyContent:'center',borderRadius:15,backgroundColor:filled?T.redSoft:T.white,borderWidth:1,borderColor:T.line,opacity:pressed?.65:1}]}><Icon name={icon} color={color}/></Pressable>;
}
const styles=StyleSheet.create({
 label:{fontSize:13,fontWeight:'800',color:T.ink,letterSpacing:-0.1},
 heading:{fontSize:24,lineHeight:31,letterSpacing:-.85,fontWeight:'800',color:T.ink},
 body:{fontSize:14,lineHeight:21,color:T.ink},
 small:{fontSize:12,lineHeight:18,color:T.muted},
 surface:{padding:18,borderRadius:22,backgroundColor:T.white,borderWidth:1,borderColor:T.line,shadowColor:T.navy,shadowOpacity:0.035,shadowRadius:14,shadowOffset:{width:0,height:5},elevation:1},
 button:{minHeight:52,borderRadius:16,alignItems:'center',justifyContent:'center',gap:9,flexDirection:'row',borderWidth:1,paddingHorizontal:14}
});
